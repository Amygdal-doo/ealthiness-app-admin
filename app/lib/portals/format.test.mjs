// Run with `npm test` (node --test; Node >= 22.18 strips the TS types).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canSubmitForReview,
  formatMoney,
  formatMonth,
  idsOf,
  inviteMailto,
  isEmail,
  latestShown,
  managedOrgs,
  parseDomains,
  requestsFor,
  reviewBadge,
} from "./format.ts";

test("formatMoney turns cents into currency", () => {
  assert.equal(formatMoney(12345, "usd"), "$123.45");
  assert.equal(formatMoney(0, "eur"), "€0.00");
  assert.equal(formatMoney(null), "$0.00");
  assert.match(formatMoney(500, "bam"), /5\.00/);
});

test("formatMonth", () => {
  assert.equal(formatMonth("2026-11"), "Nov 2026");
  assert.equal(formatMonth("bad"), "bad");
});

test("idsOf accepts ids and populated objects", () => {
  assert.deepEqual(idsOf(["a", { id: "b" }, { _id: "c" }, null, {}]), ["a", "b", "c"]);
  assert.deepEqual(idsOf(undefined), []);
});

test("managedOrgs keeps current staff memberships of one type, once each", () => {
  const ms = [
    { orgType: "hospital", org: "h1", orgName: "City", role: "admin", status: "active" },
    { orgType: "hospital", org: "h1", orgName: "City", role: "clinician", status: "active" },
    { orgType: "hospital", org: "h2", orgName: null, role: "clinician", status: "left" },
    { orgType: "hospital", org: "h3", orgName: null, role: "patient", status: "active" },
    { orgType: "gym", org: "g1", orgName: "Iron", role: "admin", status: "active" },
  ];
  assert.deepEqual(managedOrgs(ms, "hospital", ["admin", "clinician"]), [
    { id: "h1", name: "City", role: "admin" },
  ]);
  assert.deepEqual(managedOrgs(ms, "gym", ["admin"]), [{ id: "g1", name: "Iron", role: "admin" }]);
  assert.deepEqual(managedOrgs(null, "gym", ["admin"]), []);
});

test("requestsFor filters by type and org", () => {
  const rs = [
    { orgType: "gym", org: "g1" },
    { orgType: "gym", org: "g2" },
    { orgType: "company", org: "c1" },
  ];
  assert.equal(requestsFor(rs, "gym").length, 2);
  assert.equal(requestsFor(rs, "gym", "g2").length, 1);
  assert.equal(requestsFor(rs, "hospital").length, 0);
});

test("reviewBadge and canSubmitForReview", () => {
  assert.equal(reviewBadge("pending", "public").tone, "pending");
  assert.equal(reviewBadge("rejected", "public").label, "Rejected");
  assert.equal(reviewBadge("none", "coach_group").label, "Private (my group)");
  assert.equal(reviewBadge(undefined, "public").label, "Public");
  assert.equal(canSubmitForReview("pending"), false);
  assert.equal(canSubmitForReview("approved"), false);
  assert.equal(canSubmitForReview("rejected"), true);
  assert.equal(canSubmitForReview(undefined), true);
});

test("latestShown skips withheld weeks", () => {
  const rows = [
    { week: "w1", value: 5, withheld: false },
    { week: "w2", value: 7, withheld: false },
    { week: "w3", value: null, withheld: true },
  ];
  assert.equal(latestShown(rows)?.week, "w2");
  assert.equal(latestShown([{ week: "x", value: null, withheld: true }]), null);
});

test("inviteMailto encodes the code and link", () => {
  const url = inviteMailto(" a@b.com ", "Iron Gym", { displayCode: "ABCD-EFGH", joinLink: "https://x/j/abc" });
  assert.ok(url.startsWith("mailto:a%40b.com?subject="));
  assert.ok(decodeURIComponent(url).includes("ABCD-EFGH"));
  assert.ok(decodeURIComponent(url).includes("https://x/j/abc"));
});

test("parseDomains normalises input", () => {
  assert.deepEqual(parseDomains("@Amygdal.com, https://acme.io/x\nacme.io"), ["amygdal.com", "acme.io"]);
  assert.deepEqual(parseDomains("  "), []);
});

test("isEmail", () => {
  assert.equal(isEmail("a@b.co"), true);
  assert.equal(isEmail("nope"), false);
});
