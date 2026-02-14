import assert from "node:assert/strict";
import test from "node:test";

import { getPortfolioAssets } from "../../lib/adaptive/portfolio-index";
import {
  getCompanyProfileById,
  getCompanyProfiles,
  getDefaultPersonaForCompany,
  getPersonaById,
} from "../../lib/adaptive/profiles";
import { getInterviewRecommendationBundle } from "../../lib/adaptive/recommendations";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const SAFE_URL_PATTERN = /^(\/(?!\/)|https:\/\/)/;

test("adaptive company profiles expose valid ids, themes, and source metadata", () => {
  const companies = getCompanyProfiles();
  assert.ok(companies.length >= 2);

  const uniqueCompanyIds = new Set(companies.map((company) => company.id));
  assert.equal(uniqueCompanyIds.size, companies.length);

  for (const company of companies) {
    assert.ok(company.name.length > 0);
    assert.match(company.website, /^https:\/\//);
    assert.ok(company.priorityTags.length > 0);
    assert.ok(company.personas.length > 0);
    assert.ok(company.sources.length > 0);
    for (const source of company.sources) {
      assert.match(source, /^https:\/\//);
    }

    const foundCompany = getCompanyProfileById(company.id);
    assert.equal(foundCompany?.id, company.id);
    assert.equal(foundCompany?.name, company.name);

    const defaultPersona = getDefaultPersonaForCompany(company.id);
    assert.equal(defaultPersona?.id, company.personas[0]?.id);

    const uniquePersonaIds = new Set(company.personas.map((persona) => persona.id));
    assert.equal(uniquePersonaIds.size, company.personas.length);

    for (const persona of company.personas) {
      assert.match(persona.id, /^[a-z0-9-]{3,80}$/);
      assert.ok(persona.name.length > 0);
      assert.ok(persona.role.length > 0);
      assert.ok(persona.focusTags.length > 0);
      assert.ok(persona.recommendationGoal.length > 0);
      assert.equal(getPersonaById(company.id, persona.id)?.id, persona.id);
    }

    for (const modeTheme of [company.theme.light, company.theme.dark]) {
      assert.match(modeTheme.primary, HEX_COLOR_PATTERN);
      assert.match(modeTheme.accent, HEX_COLOR_PATTERN);
      assert.match(modeTheme.ring, HEX_COLOR_PATTERN);
      if (modeTheme.background) assert.match(modeTheme.background, HEX_COLOR_PATTERN);
      if (modeTheme.foreground) assert.match(modeTheme.foreground, HEX_COLOR_PATTERN);
      if (modeTheme.muted) assert.match(modeTheme.muted, HEX_COLOR_PATTERN);
      if (modeTheme.border) assert.match(modeTheme.border, HEX_COLOR_PATTERN);
    }
  }
});

test("portfolio index assets are unique and use safe deterministic metadata", () => {
  const assets = getPortfolioAssets();
  assert.ok(assets.length > 0);

  const uniqueIds = new Set(assets.map((asset) => asset.id));
  assert.equal(uniqueIds.size, assets.length);

  for (const asset of assets) {
    assert.ok(asset.title.trim().length > 0);
    assert.ok(asset.summary.trim().length > 0);
    assert.ok(asset.tags.length > 0);
    assert.match(asset.url, SAFE_URL_PATTERN);
    assert.equal(/javascript:/i.test(asset.url), false);
  }
});

test("each configured persona resolves to a non-empty recommendation bundle", () => {
  const companies = getCompanyProfiles();

  for (const company of companies) {
    for (const persona of company.personas) {
      const bundle = getInterviewRecommendationBundle(company.id, persona.id);
      assert.ok(bundle);
      assert.equal(bundle.company.id, company.id);
      assert.equal(bundle.persona.id, persona.id);
      assert.ok(bundle.topRecommendations.length > 0);
      assert.ok(bundle.supportingRecommendations.length <= 4);
      assert.ok(bundle.talkingPoints.length >= 1);

      for (const recommendation of bundle.topRecommendations) {
        assert.match(recommendation.asset.url, SAFE_URL_PATTERN);
        assert.ok(recommendation.reason.length > 0);
      }
    }
  }
});
