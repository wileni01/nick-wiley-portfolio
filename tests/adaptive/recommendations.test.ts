import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDeterministicNarrative,
  getInterviewRecommendationBundle,
  supportedCompanyIds,
} from "../../lib/adaptive/recommendations";
import { getCompanyProfiles } from "../../lib/adaptive/profiles";

test("supported company list includes expected default profiles", () => {
  assert.deepEqual(supportedCompanyIds, ["kungfu-ai", "anthropic"]);
});

test("recommendation bundle is deterministic for kungfu CTO persona", () => {
  const first = getInterviewRecommendationBundle("kungfu-ai", "kungfu-cto");
  const second = getInterviewRecommendationBundle("kungfu-ai", "kungfu-cto");

  assert.ok(first);
  assert.ok(second);

  assert.deepEqual(
    first.topRecommendations.map((item) => ({
      id: item.asset.id,
      score: item.score,
      reason: item.reason,
    })),
    second.topRecommendations.map((item) => ({
      id: item.asset.id,
      score: item.score,
      reason: item.reason,
    }))
  );
  assert.deepEqual(
    first.supportingRecommendations.map((item) => item.asset.id),
    second.supportingRecommendations.map((item) => item.asset.id)
  );
});

test("top recommendations are bounded, sorted, diverse, and safe", () => {
  const bundle = getInterviewRecommendationBundle("kungfu-ai", "kungfu-cto");
  assert.ok(bundle);

  assert.ok(bundle.topRecommendations.length > 0);
  assert.ok(bundle.topRecommendations.length <= 5);
  assert.ok(bundle.supportingRecommendations.length <= 4);

  const topIds = new Set(bundle.topRecommendations.map((item) => item.asset.id));
  for (const supporting of bundle.supportingRecommendations) {
    assert.equal(topIds.has(supporting.asset.id), false);
  }

  for (let i = 1; i < bundle.topRecommendations.length; i++) {
    assert.ok(
      bundle.topRecommendations[i - 1].score >= bundle.topRecommendations[i].score
    );
  }

  const perKindCount = bundle.topRecommendations.reduce<Record<string, number>>(
    (acc, recommendation) => {
      acc[recommendation.asset.kind] = (acc[recommendation.asset.kind] ?? 0) + 1;
      return acc;
    },
    {}
  );
  for (const count of Object.values(perKindCount)) {
    assert.ok(count <= 2);
  }

  for (const recommendation of bundle.topRecommendations) {
    assert.ok(recommendation.asset.url.startsWith("/"));
    assert.equal(/javascript:/i.test(recommendation.asset.url), false);
    assert.ok(recommendation.reason.length > 0);
  }
});

test("anthropic ceo narrative includes mode goal and selected assets", () => {
  const narrative = buildDeterministicNarrative("anthropic", "anthropic-ceo");
  assert.ok(
    narrative.includes(
      "Demonstrate safety-minded delivery, robust human oversight, and disciplined deployment in regulated environments."
    )
  );
  assert.ok(narrative.includes("Recommended first pass:"));
});

test("invalid mode identifiers fall back to guidance narrative", () => {
  assert.equal(
    buildDeterministicNarrative("anthropic", "does-not-exist"),
    "Select a company and persona to generate tailored interview recommendations."
  );
});

test("all configured personas produce bounded, unique, and safe recommendation sets", () => {
  const companies = getCompanyProfiles();

  for (const company of companies) {
    for (const persona of company.personas) {
      const bundle = getInterviewRecommendationBundle(company.id, persona.id);
      assert.ok(bundle, `${company.id}/${persona.id} should return a bundle`);
      if (!bundle) continue;

      assert.ok(bundle.topRecommendations.length > 0);
      assert.ok(bundle.topRecommendations.length <= 5);
      assert.ok(bundle.supportingRecommendations.length <= 4);
      assert.ok(bundle.talkingPoints.length >= 1);
      assert.ok(bundle.talkingPoints.length <= 3);

      const topIds = new Set(bundle.topRecommendations.map((item) => item.asset.id));
      assert.equal(topIds.size, bundle.topRecommendations.length);
      for (const supporting of bundle.supportingRecommendations) {
        assert.equal(topIds.has(supporting.asset.id), false);
      }

      for (const recommendation of [
        ...bundle.topRecommendations,
        ...bundle.supportingRecommendations,
      ]) {
        assert.match(recommendation.asset.url, /^(\/(?!\/)|https:\/\/)/);
        assert.equal(/javascript:/i.test(recommendation.asset.url), false);
        assert.ok(recommendation.reason.length > 0);
      }
    }
  }
});
