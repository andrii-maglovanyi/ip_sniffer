import { isMaster, fork } from "cluster";
import { Socket } from "net";

const MAX = 65535;
const IP_REGEXP = /^((?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4})|(([0-9a-f]){1,4}(:([0-9a-f]){1,4}){7})$/g;

export const getArguments = (args: string[] = []) => {
  if (args.length < 3) {
    throw new Error("Not enough arguments.");
  } else if (args.length > 5) {
    throw new Error("Too many arguments.");
  }

  const flag = args[2];
  const match = flag.match(IP_REGEXP);

  if (match?.length) {
    return {
      ip: match[0],
      threads: 4,
    };
  } else {
    if ((flag.includes("-h") || flag.includes("-help")) && args.length === 3) {
      process.stdout.write(
        `Usage: -j to select how many threads you want
        \r\n    -h or -help to show this help message.`
      );
      throw new Error("help");
    } else if (flag.includes("-h") || flag.includes("-help")) {
      throw new Error("Too many arguments.");
    } else if (flag.includes("-j")) {
      const threads = parseInt(args[3], 10);

      if (!threads) {
        throw new Error("Failed to parse thread number.");
      }

      const match = args[4].match(IP_REGEXP);

      if (!match?.length) {
        throw new Error("Not a valid IPADDR; Must be IPv4 or IPv6.");
      }

      return {
        ip: match[0],
        threads,
      };
    } else {
      throw new Error("Invalid syntax.");
    }
  }
};

const isOpen = async (port: number, host: string, timeout = 2000) => {
  const promise = new Promise((resolve, reject) => {
    const socket = new Socket();

    const onError = () => {
      socket.destroy();
      reject();
    };

    socket.setTimeout(timeout);
    socket.once("error", onError);
    socket.once("timeout", onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });

  try {
    await promise;
    return true;
  } catch (err) {
    return false;
  }
};

const sendMessage = (message: string | number) =>
  process.send && process.send(message);

const scan = async (startPort: number, host: string, numThreads: number) => {
  let port = startPort + 1;

  while (numThreads < MAX - port) {
    if (await isOpen(port, host)) {
      process.stdout.write("*");
      sendMessage(port);
    } else {
      process.stdout.write(".");
    }

    port += numThreads;
  }

  sendMessage("done");
};

const printReport = (result: number[]) => {
  result.sort((a, b) => a - b);

  process.stdout.write(`\n\nopen ports\n`);
  result.forEach((port) => process.stdout.write(`${port}\n`));
  process.exit(0);
};

const main = () => {
  if (isMaster) {
    let finished = 0;
    let result: number[] = [];

    try {
      const { ip, threads } = getArguments(process.argv);

      for (let i = 0; i < threads; i++) {
        fork({ startPort: i, host: ip, numThreads: threads }).on(
          "message",
          (message: number | "done") => {
            if (message === "done") {
              finished++;
            } else {
              result.push(message);
            }

            if (finished === threads) {
              printReport(result);
            }
          }
        );
      }
    } catch (error) {
      if (error.message === "help") {
        process.exit(0);
      } else {
        process.stderr.write(`Problem parsing arguments ${error.message}`);
      }
    }
  } else {
    const { startPort, host, numThreads } = process.env;

    if (startPort && host && numThreads) {
      scan(parseInt(startPort, 10), host, parseInt(numThreads, 10));
    }
  }
};

main();
