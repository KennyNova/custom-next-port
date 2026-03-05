"use client";

import { ChangeEvent, ReactNode, useMemo, useState } from "react";
import styles from "./page.module.css";

type PackageTier = {
  id: string;
  name: string;
  price: number;
  delivery: string;
  support: string;
  revisions: string;
  selfSetupDocs: boolean;
  hasTranscriptPulling: boolean;
  hasMultiSourceYoutubeAudio: boolean;
  hasFullThreeSource: boolean;
  customThemeByYou: boolean;
  setupFeePerSite: number;
  allowsExclusive: boolean;
  recommended?: boolean;
  features: string[];
};

type AddonItem = {
  id: string;
  title: string;
  tip: string;
  note: string;
  pricingType: "one-time" | "per-site";
  amount: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const packages: PackageTier[] = [
  {
    id: "launch",
    name: "Launch",
    price: 250,
    delivery: "Standard: 2-3 business days. Rush: 1-2 business days.",
    support: "7 days email support",
    revisions: "1 round",
    selfSetupDocs: true,
    hasTranscriptPulling: false,
    hasMultiSourceYoutubeAudio: false,
    hasFullThreeSource: false,
    customThemeByYou: false,
    setupFeePerSite: 30,
    allowsExclusive: false,
    features: [
      "One audio source setup (RSS or Megaphone).",
      "Podcast pages and player ready to use.",
      "Step-by-step docs so your team can install and add API keys.",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 500,
    delivery: "Standard: 3-5 business days. Rush: 2-3 business days.",
    support: "14 days priority email support",
    revisions: "1 round",
    selfSetupDocs: true,
    hasTranscriptPulling: false,
    hasMultiSourceYoutubeAudio: false,
    hasFullThreeSource: false,
    customThemeByYou: false,
    setupFeePerSite: 50,
    allowsExclusive: false,
    features: [
      "One audio source setup (RSS or Megaphone).",
      "Podcast pages and player ready to use.",
      "Cleaner grouped source display and basic dashboard stats.",
      "Transcript tools are not included in this tier.",
      "Step-by-step docs so your team can install and add API keys.",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 750,
    delivery: "Standard: 5-7 business days. Rush: 3-4 business days.",
    support: "30 days support + 1 live call",
    revisions: "2 rounds",
    selfSetupDocs: false,
    hasTranscriptPulling: true,
    hasMultiSourceYoutubeAudio: true,
    hasFullThreeSource: false,
    customThemeByYou: true,
    setupFeePerSite: 100,
    allowsExclusive: false,
    features: [
      "One audio source setup (RSS or Megaphone).",
      "Podcast pages and player ready to use.",
      "Cleaner grouped source display and basic dashboard stats.",
      "Transcript pull and upload tools.",
      "YouTube and one additional audio source setup.",
      "Automatic updates and bulk management tools.",
      "Custom theme setup by me for each website.",
    ],
  },
  {
    id: "agency-plus",
    name: "Agency Plus",
    price: 1000,
    delivery: "Standard: 3-5 business days. Rush: 2-3 business days.",
    support: "45 days priority support + 2 dedicated live calls",
    revisions: "3 rounds",
    selfSetupDocs: false,
    hasTranscriptPulling: true,
    hasMultiSourceYoutubeAudio: true,
    hasFullThreeSource: true,
    customThemeByYou: true,
    setupFeePerSite: 30,
    allowsExclusive: true,
    recommended: true,
    features: [
      "One audio source setup (RSS or Megaphone).",
      "Podcast pages and player ready to use.",
      "Cleaner grouped source display and basic dashboard stats.",
      "Transcript pull and upload tools.",
      "Full 3-source setup (YouTube, Megaphone, and RSS).",
      "Automatic updates and bulk management tools.",
      "Automated transcript ingestion — formatted and live on launch day, zero manual steps for you or your client.",
      "Premium custom theme for each client site — colors, wording, and branding dialed in.",
      "Exclusive license included — the plugin design leaves my library. You're the only one running this version in the market.",
    ],
  },
];

function yesNoPill(isYes: boolean) {
  return <span className={isYes ? styles.pillYes : styles.pillNo}>{isYes ? "Included" : "Not included"}</span>;
}

function sourceCell(pkg: PackageTier) {
  if (pkg.id === "launch" || pkg.id === "growth") {
    return (
      <span className={styles.sourceCell}>
        <span className={styles.sourceBadge}>Megaphone</span>
        <span className={styles.sourceBadge}>RSS</span>
        <span className={styles.sourceTag}>Pick 1 audio source</span>
      </span>
    );
  }
  if (pkg.id === "pro") {
    return (
      <span className={styles.sourceCell}>
        <span className={styles.sourceBadge}>YouTube</span>
        <span className={styles.sourceBadge}>Megaphone</span>
        <span className={styles.sourceTag}>YouTube + 1 audio source</span>
      </span>
    );
  }
  return (
    <span className={styles.sourceCell}>
      <span className={styles.sourceBadge}>YouTube</span>
      <span className={styles.sourceBadge}>Megaphone</span>
      <span className={styles.sourceBadge}>RSS</span>
      <span className={styles.sourceTag}>All 3 included</span>
    </span>
  );
}

function customThemeCell(pkg: PackageTier) {
  if (!pkg.customThemeByYou) return yesNoPill(false);
  if (pkg.id === "pro") {
    return (
      <span className={styles.pillYes} title="I will configure the plugin to match the site wording and colors.">
        Included
      </span>
    );
  }
  return (
    <span
      className={styles.pillYes}
      title="I provide a custom theme tailored to each site, updating appearance details to fit the website and the client vision."
    >
      Included+
    </span>
  );
}

function exclusiveLicenseCell(pkg: PackageTier) {
  if (pkg.allowsExclusive) {
    return <span className={styles.pillYes}>Included</span>;
  }
  return (
    <span className={styles.pillAddon} title="Standard packages grant a usage license, but the plugin design remains in my library for future work. The exclusive buyout guarantees you're the only one running this version.">
      Add-on +$350
    </span>
  );
}

function getMissingAddons(pkg: PackageTier): AddonItem[] {
  const items: AddonItem[] = [];
  if (!pkg.hasTranscriptPulling) {
    items.push({
      id: "addon-transcript-tools",
      title: "Transcript tools (+$100)",
      tip: "Adds transcript pull and upload capabilities.",
      note: "$100 one-time",
      pricingType: "one-time",
      amount: 100,
    });
  }
  if (!pkg.hasMultiSourceYoutubeAudio) {
    items.push({
      id: "addon-youtube-extra-audio",
      title: "YouTube source setup (+$200)",
      tip: "Adds YouTube as a source.",
      note: "$200 one-time",
      pricingType: "one-time",
      amount: 200,
    });
  }
  if (!pkg.customThemeByYou) {
    items.push({
      id: "addon-custom-theme",
      title: "Custom theme by me per site (+$100/site)",
      tip: "I apply your branding and style per client site.",
      note: "$100 per site",
      pricingType: "per-site",
      amount: 100,
    });
  }
  return items;
}

export default function PodcastPricingPage() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [clientSitesText, setClientSitesText] = useState<string>("1");
  const [siteError, setSiteError] = useState<string>("");
  const [fullSetup, setFullSetup] = useState(false);
  const [rushDelivery, setRushDelivery] = useState(false);
  const [exclusiveDesign, setExclusiveDesign] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackageId) ?? null,
    [selectedPackageId]
  );

  const clientSites = useMemo(() => {
    const parsed = Number.parseInt(clientSitesText, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return 1;
    }
    return parsed;
  }, [clientSitesText]);

  const missingAddons = useMemo(() => {
    if (!selectedPackage) return [];
    return getMissingAddons(selectedPackage);
  }, [selectedPackage]);

  const selectedAddonItems = useMemo(
    () => missingAddons.filter((addon) => selectedAddons[addon.id]),
    [missingAddons, selectedAddons]
  );

  const totals = useMemo(() => {
    if (!selectedPackage) {
      return {
        payNow: 0,
        monthly: 0,
        perClientNow: 0,
        perClientMonthly: 0,
        breakdown: ["Pick a base package to get started."],
      };
    }

    const baseCost = selectedPackage.price;
    const setupPerSite = fullSetup ? selectedPackage.setupFeePerSite : 0;
    const setupTotal = setupPerSite * clientSites;
    const isExclusiveAllowed = selectedPackage.id !== "agency-plus";
    const exclusiveFee = isExclusiveAllowed && exclusiveDesign ? 350 : 0;

    const addonOneTimeTotal = selectedAddonItems
      .filter((addon) => addon.pricingType === "one-time")
      .reduce((sum, addon) => sum + addon.amount, 0);

    const addonPerSiteTotal = selectedAddonItems
      .filter((addon) => addon.pricingType === "per-site")
      .reduce((sum, addon) => sum + addon.amount * clientSites, 0);

    const oneTimeSubtotal = baseCost + setupTotal + exclusiveFee + addonOneTimeTotal + addonPerSiteTotal;
    const rushFee = rushDelivery && fullSetup ? setupTotal * 0.2 : 0;
    const payNow = oneTimeSubtotal + rushFee;

    const monthly = maintenance ? 10 * clientSites : 0;
    const perClientNow = payNow / clientSites;
    const perClientMonthly = monthly / clientSites;

    const breakdown: string[] = [`Base package (${selectedPackage.name}): ${currency.format(baseCost)}`, `Client sites: ${clientSites}`];

    if (fullSetup) {
      breakdown.push(
        `Done-for-you setup: ${currency.format(setupPerSite)} x ${clientSites} = ${currency.format(setupTotal)}`
      );
    } else {
      breakdown.push("Done-for-you setup: Not selected");
    }

    if (exclusiveFee > 0) {
      breakdown.push(`Exclusive license buyout add-on: ${currency.format(exclusiveFee)}`);
    }

    selectedAddonItems.forEach((addon) => {
      if (addon.pricingType === "per-site") {
        breakdown.push(
          `${addon.title}: ${currency.format(addon.amount)} x ${clientSites} = ${currency.format(addon.amount * clientSites)}`
        );
      } else {
        breakdown.push(`${addon.title}: ${currency.format(addon.amount)}`);
      }
    });

    if (rushFee > 0) {
      breakdown.push(`Rush fee (20% of setup total): ${currency.format(rushFee)}`);
    } else if (rushDelivery && !fullSetup) {
      breakdown.push("Rush fee: $0 (select done-for-you setup to apply rush per-site setup pricing)");
    }

    breakdown.push(`One-time due now: ${currency.format(payNow)}`);

    if (maintenance) {
      breakdown.push(
        `Monthly maintenance and monitoring: ${currency.format(10)} x ${clientSites} = ${currency.format(monthly)}/month`
      );
    } else {
      breakdown.push("Monthly maintenance and monitoring: Not selected");
    }

    return { payNow, monthly, perClientNow, perClientMonthly, breakdown };
  }, [clientSites, exclusiveDesign, fullSetup, maintenance, rushDelivery, selectedAddonItems, selectedPackage]);

  function handleSiteCountChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setClientSitesText(value);
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setSiteError("Please enter at least 1 client site.");
      return;
    }
    setSiteError("");
  }

  function handlePackageSelect(id: string) {
    setSelectedPackageId(id);
    setSelectedAddons({});
    if (id === "agency-plus") {
      setExclusiveDesign(false);
    }
  }

  function handleReset() {
    setSelectedPackageId("");
    setClientSitesText("1");
    setSiteError("");
    setFullSetup(false);
    setRushDelivery(false);
    setExclusiveDesign(false);
    setMaintenance(false);
    setSelectedAddons({});
  }

  const tableRows: { label: string; tip: string; getValue: (pkg: PackageTier) => ReactNode }[] = [
    {
      label: "One-time package fee",
      tip: "The upfront price you pay once. This covers everything listed in this row and below—the features, support, revisions, and delivery timeline.",
      getValue: (pkg) => currency.format(pkg.price),
    },
    {
      label: "Included source types",
      tip: "What kinds of podcast or video sources you can connect. RSS works with any podcast feed. Megaphone is for podcasts hosted on Megaphone or Spotify. YouTube is for connecting your YouTube channel videos.",
      getValue: (pkg) => sourceCell(pkg),
    },
    {
      label: "Transcript tools",
      tip: "Automatically pulls and attaches transcripts to your videos—no manual work needed.",
      getValue: (pkg) => yesNoPill(pkg.hasTranscriptPulling),
    },
    {
      label: "Custom theme by me",
      tip: "Included: I update colors and styling to match your site while keeping the layout the same. Included+: I analyze your site and create a custom layout that matches it perfectly.",
      getValue: (pkg) => customThemeCell(pkg),
    },
    {
      label: "Done-for-you setup option",
      tip: "I handle everything: installing the plugin, setting up API keys, connecting your podcast feeds, and configuring the basics. You don't need to touch anything.",
      getValue: (pkg) => `${currency.format(pkg.setupFeePerSite)}/site`,
    },
    {
      label: "Support",
      tip: "I respond within 1 business day. Covers questions, setup help, and bug fixes.",
      getValue: (pkg) => pkg.support,
    },
    {
      label: "Revisions",
      tip: "A revision is one round of changes you request—like removing a section, adding something new, or tweaking how things look. You can send multiple changes at once, but they count as one revision as long as they're in a single batch.",
      getValue: (pkg) => pkg.revisions,
    },
    {
      label: "Delivery time",
      tip: "How long until your project is ready. Rush puts you in a faster queue so the pages goes live sooner.",
      getValue: (pkg) => pkg.delivery,
    },
    {
      label: "Exclusive license buyout (+$350)",
      tip: "Standard packages grant a usage license, but the plugin design remains in my library for future work. The exclusive buyout guarantees you're the only one running this version in the market.",
      getValue: (pkg) => exclusiveLicenseCell(pkg),
    },
    {
      label: "Documentation",
      tip: "Step-by-step guides for installing the plugin, getting your API keys, and using the plugin day-to-day.",
      getValue: () => yesNoPill(true),
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.gradientGlow} aria-hidden="true" />
      <div className={styles.wrapper}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>White-Label Pricing</p>
          <h1>Podcast Agency Pricing Calculator</h1>
          <p className={styles.sub}>
            Choose a package first, then pick extras. This tool shows what you pay now, what you pay each month, and how much it is per client site.
          </p>
        </header>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Package Comparison</h2>
            <p>Quick view of what each package includes. Hover info badges for plain-English help.</p>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.priceTable} aria-label="Pricing tier comparison table">
              <thead>
                <tr>
                  <th className={styles.rowLabel}>Feature</th>
                  {packages.map((pkg) => (
                    <th key={pkg.id} className={pkg.recommended ? styles.agencyPlusCol : undefined}>
                      <div className={styles.tierHead}>
                        <span className={styles.tierName}>{pkg.name}</span>
                        <span className={styles.tierAmount}>{currency.format(pkg.price)}</span>
                        {pkg.recommended && (
                          <span className={styles.recommendedBadge}>Agency Recommended</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.label}>
                    <td className={styles.rowLabel}>
                      {row.label}
                      <span className={styles.info} title={row.tip}>
                        i
                      </span>
                    </td>
                    {packages.map((pkg) => (
                      <td key={`${row.label}-${pkg.id}`} className={pkg.recommended ? styles.agencyPlusCol : undefined}>
                        {row.getValue(pkg)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className={styles.grid}>
          <div>
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <h2>1) Pick a Base Package</h2>
              </div>
              <div className={styles.tierGrid}>
                {packages.map((pkg) => {
                  const selected = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      className={`${styles.tierOption} ${selected ? styles.selectedTier : ""} ${pkg.recommended ? styles.agencyPlusTier : ""}`}
                      onClick={() => handlePackageSelect(pkg.id)}
                      type="button"
                    >
                      <span className={styles.tierTop}>
                        <span className={styles.tierName}>{pkg.name}</span>
                        <span className={styles.tierAmount}>{currency.format(pkg.price)}</span>
                      </span>
                      <span className={styles.tierDelivery}>{pkg.delivery}</span>
                      {pkg.recommended && (
                        <span className={styles.recommendedBadge}>Agency Recommended</span>
                      )}
                      {pkg.allowsExclusive && (
                        <span className={styles.exclusiveTag}>★ Exclusive — only you run this version</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedPackage && (
              <>
                <section className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <h2>2) Client Site Count</h2>
                  </div>
                  <div className={styles.row}>
                    <label htmlFor="clientSites">How many client sites are you pricing for?</label>
                    <input id="clientSites" type="number" min={1} step={1} value={clientSitesText} onChange={handleSiteCountChange} />
                  </div>
                  <p className={styles.error}>{siteError}</p>
                </section>

                <section className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <h2>3) What You Get in This Package</h2>
                  </div>
                  <ul className={styles.features}>
                    {selectedPackage.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  {selectedPackage.id === "agency-plus" && (
                    <div className={styles.vsPro}>
                      <p className={styles.vsProLabel}>For $250 more than Pro, you also get:</p>
                      <ul className={styles.vsProList}>
                        <li>+15 days priority support <span>(45 days vs 30)</span></li>
                        <li>+1 dedicated live call <span>(2 total vs 1)</span></li>
                        <li>+1 revision round <span>(3 total vs 2)</span></li>
                        <li>Full 3-source setup <span>(YouTube + Megaphone + RSS, vs YouTube + 1)</span></li>
                        <li>Automated transcript delivery <span>(vs manual upload tools)</span></li>
                        <li>Premium theme per site <span>(vs standard custom theme)</span></li>
                        <li>Exclusive license included <span>(the design leaves my library — you&apos;re the only one running it)</span></li>
                        <li>Lowest per-site setup fee <span>($30/site vs $100 on Pro)</span></li>
                      </ul>
                    </div>
                  )}
                </section>

                <section className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <h2>4) Setup and Speed Options</h2>
                  </div>
                  <label className={styles.checkline}>
                    <input type="checkbox" checked={fullSetup} onChange={(event) => setFullSetup(event.target.checked)} />
                    <span>Done-for-You Setup Per Site ({currency.format(selectedPackage.setupFeePerSite)}/site)</span>
                    <span className={styles.info} title="I handle setup for each client site: plugin install, API keys, and core settings.">
                      i
                    </span>
                  </label>

                  <label className={styles.checkline}>
                    <input type="checkbox" checked={rushDelivery} onChange={(event) => setRushDelivery(event.target.checked)} />
                    <span>Rush Delivery (+20% on per-site setup)</span>
                    <span className={styles.info} title="Rush puts your project in a faster queue and adds 20% to setup totals.">
                      i
                    </span>
                  </label>

                  {selectedPackage.id !== "agency-plus" ? (
                    <>
                      <label className={styles.checkline}>
                        <input type="checkbox" checked={exclusiveDesign} onChange={(event) => setExclusiveDesign(event.target.checked)} />
                        <span>Exclusive License Buyout (+$350) — Be the only one running this version</span>
                        <span className={styles.info} title="Standard packages grant a usage license, but the plugin design remains in my library for future work. The exclusive buyout guarantees you're the only one running this version in the market.">
                          i
                        </span>
                      </label>
                      {exclusiveDesign && (
                        <div className={styles.exclusiveHint}>
                          Agency Plus includes the exclusive license at no extra charge — the plugin design leaves my library and you&apos;re the only one running it. You&apos;re adding $350 here; upgrading may save you money.
                          <button
                            type="button"
                            className={styles.switchBtnSmall}
                            onClick={() => handlePackageSelect("agency-plus")}
                          >
                            Switch to Agency Plus →
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.exclusiveIncluded}>
                      <span className={styles.exclusiveIcon}>★</span>
                      <div>
                        <strong>Exclusive License Included</strong>
                        <p>Standard packages grant a usage license, but the plugin design stays in my library for future work. With this tier, the design leaves my library — you&apos;re guaranteed to be the only one running this version in the market.</p>
                      </div>
                    </div>
                  )}
                </section>

                <section className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <h2>5) Monthly Service</h2>
                  </div>
                  <label className={styles.checkline}>
                    <input type="checkbox" checked={maintenance} onChange={(event) => setMaintenance(event.target.checked)} />
                    <span>Unlimited maintenance and monitoring ($10/month per client site)</span>
                    <span className={styles.info} title="Ongoing monthly care per active client site: support, checks, and issue monitoring.">
                      i
                    </span>
                  </label>
                </section>

                <section className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <h2>6) Optional Add-Ons for Missing Features</h2>
                    <p>If this package is missing something you want, click to add fixed-price add-ons.</p>
                  </div>
                  {selectedPackage.id === "pro" && (
                    <div className={styles.upgradeNudge}>
                      <strong>Still on Pro?</strong>
                      <p>
                        Agency Plus is only $250 more and includes full 3-source, automated transcript delivery on launch day, premium theming, 2 dedicated live calls, and an exclusive license — no add-ons needed.
                      </p>
                      <button
                        type="button"
                        className={styles.switchBtn}
                        onClick={() => handlePackageSelect("agency-plus")}
                      >
                        Upgrade to Agency Plus →
                      </button>
                    </div>
                  )}
                  <div className={styles.addonList}>
                    {missingAddons.length === 0 && (
                      <div className={styles.addonItem}>
                        <strong>No missing features in this tier.</strong>
                        <p>This package already includes all core feature blocks.</p>
                      </div>
                    )}
                    {missingAddons.map((addon) => (
                      <label key={addon.id} className={styles.addonItem}>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedAddons[addon.id])}
                          onChange={(event) => {
                            setSelectedAddons((prev) => ({ ...prev, [addon.id]: event.target.checked }));
                          }}
                        />
                        <span>
                          <span className={styles.addonTitle}>
                            {addon.title}
                            <span className={styles.info} title={addon.tip}>
                              i
                            </span>
                          </span>
                          <span className={styles.addonTag}>{addon.note}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              </>
            )}

            <section className={styles.actions}>
              <button className={styles.resetButton} type="button" onClick={handleReset}>
                Reset
              </button>
            </section>
          </div>

          <aside className={styles.summary}>
            <h2>Live Price Summary</h2>
            <div className={styles.summaryValues}>
              <div className={`${styles.kpi} ${styles.payNow}`}>
                <span>Pay Now (One-Time)</span>
                <strong>{currency.format(totals.payNow)}</strong>
              </div>
              <div className={`${styles.kpi} ${styles.monthly}`}>
                <span>Pay Monthly</span>
                <strong>{currency.format(totals.monthly)}</strong>
              </div>
              <div className={styles.kpi}>
                <span>Per Client Site (One-Time)</span>
                <strong>{currency.format(totals.perClientNow)}</strong>
              </div>
              <div className={styles.kpi}>
                <span>Per Client Site (Monthly)</span>
                <strong>{currency.format(totals.perClientMonthly)}</strong>
              </div>
            </div>

            <div className={styles.breakdown}>
              <strong>Breakdown</strong>
              <ul>
                {totals.breakdown.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p>
                Default license: agency can white-label for client websites. Optional buyout adds exclusivity.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
