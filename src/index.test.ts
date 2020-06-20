import { getArguments } from "./index";

describe("IP Sniffer", () => {
  test("Should throw 'Not enough arguments.'", () => {
    expect(() => getArguments(["~/bin/node", "~/bin/ip_sniffer"])).toThrowError(
      "Not enough arguments."
    );
  });

  test("Should throw 'Too many arguments.'", () => {
    expect(() =>
      getArguments([
        "~/bin/node",
        "~/bin/ip_sniffer",
        "-j",
        "10",
        "128.0.0.1",
        "extra",
      ])
    ).toThrowError("Too many arguments.");

    expect(() =>
      getArguments(["~/bin/node", "~/bin/ip_sniffer", "-h", "10"])
    ).toThrowError("Too many arguments.");

    expect(() =>
      getArguments(["~/bin/node", "~/bin/ip_sniffer", "-help", "10"])
    ).toThrowError("Too many arguments.");
  });

  test("Should show help message and exit", () => {
    expect(() =>
      getArguments(["~/bin/node", "~/bin/ip_sniffer", "-h"])
    ).toThrowError("help");
  });

  test("Should throw 'Invalid syntax.'", () => {
    expect(() =>
      getArguments(["~/bin/node", "~/bin/ip_sniffer", "-l"])
    ).toThrowError("Invalid syntax.");
  });

  test("Should throw 'Failed to parse thread number.'", () => {
    expect(() =>
      getArguments(["~/bin/node", "~/bin/ip_sniffer", "-j", "none"])
    ).toThrowError("Failed to parse thread number.");
  });

  test("Should throw 'Not a valid IPADDR; Must be IPv4 or IPv6.'", () => {
    const invalidIps = ["192.0..42", "1200:0000:AB00:1234:O000:2552:7777:1313"];

    invalidIps.forEach((ip) =>
      expect(() =>
        getArguments(["~/bin/node", "~/bin/ip_sniffer", "-j", "10", ip])
      ).toThrowError("Not a valid IPADDR; Must be IPv4 or IPv6.")
    );
  });
});
