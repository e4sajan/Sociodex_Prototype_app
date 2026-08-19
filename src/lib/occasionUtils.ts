/**
 * Utility functions for smart memory headings, occasion icons, and custom heading formatting.
 */

export interface MemoryHeadingConfig {
  occasion?: string;
  recipient?: string;
  customHeading?: string;
  isInvitation?: boolean;
  coupleNames?: string;
}

export interface FormattedHeading {
  badgeIcon: string;
  badgeLabel: string;
  prefix?: string;
  mainText: string;
  highlightText?: string;
  fullTitle: string;
  isCustom: boolean;
}

export const STANDARD_OCCASIONS = [
  "Birthday",
  "Wedding",
  "Farewell",
  "Anniversary",
  "Housewarming",
  "Thank You",
  "Baby Shower",
  "Just Because",
  "Other (Custom Heading)",
] as const;

/**
 * Returns an appropriate emoji icon for any standard or custom occasion name.
 */
export function getOccasionIcon(occasion?: string): string {
  if (!occasion) return "✨";
  const occ = occasion.toLowerCase().trim();

  if (occ.includes("wedding") || occ.includes("marriage") || occ.includes("matrimony")) return "💍";
  if (occ.includes("baby") || occ.includes("shower") || occ.includes("newborn")) return "🍼";
  if (occ.includes("birthday") || occ.includes("bday") || occ.includes("born")) return "🎂";
  if (occ.includes("anniversary") || occ.includes("jubilee")) return "🥂";
  if (occ.includes("housewarming") || occ.includes("home") || occ.includes("flat") || occ.includes("griha")) return "🏡";
  if (occ.includes("farewell") || occ.includes("goodbye") || occ.includes("bye") || occ.includes("send-off") || occ.includes("sendoff")) return "🌿";
  if (occ.includes("thank") || occ.includes("gratitude") || occ.includes("appreciation") || occ.includes("cheers")) return "🙏";
  if (occ.includes("trip") || occ.includes("travel") || occ.includes("tour") || occ.includes("holiday") || occ.includes("vacation") || occ.includes("retreat") || occ.includes("lonavala") || occ.includes("trek") || occ.includes("journey") || occ.includes("outing")) return "⛰️";
  if (occ.includes("team") || occ.includes("offsite") || occ.includes("corporate") || occ.includes("work") || occ.includes("office") || occ.includes("company") || occ.includes("emergy")) return "💼";
  if (occ.includes("love") || occ.includes("valentine") || occ.includes("romantic")) return "❤️";
  if (occ.includes("congrat") || occ.includes("promotion") || occ.includes("success") || occ.includes("achievement") || occ.includes("award")) return "🎉";
  if (occ.includes("reunion") || occ.includes("batch") || occ.includes("friends") || occ.includes("college") || occ.includes("school")) return "🤝";
  if (occ.includes("festival") || occ.includes("diwali") || occ.includes("christmas") || occ.includes("eid") || occ.includes("new year")) return "🎆";

  return "✨";
}

/**
 * Smartly formats the heading for a memory page, postcard, or preview.
 * Avoids awkward combinations like "Happy Thank You", "Happy Farewell", or "Happy Just Because".
 */
export function formatMemoryHeading(config: MemoryHeadingConfig): FormattedHeading {
  const occasion = (config.occasion || "").trim();
  const recipient = (config.recipient || "").trim();
  const customHeading = (config.customHeading || "").trim();
  const coupleNames = (config.coupleNames || "").trim();
  const isInvitation = !!config.isInvitation;

  const isCustomOccasion =
    occasion.toLowerCase() === "other" ||
    occasion.toLowerCase() === "other (custom heading)" ||
    occasion.toLowerCase().startsWith("other");

  const badgeIcon = getOccasionIcon(customHeading || occasion);

  // 1. Invitation Mode
  if (isInvitation) {
    const targetName = coupleNames || recipient;
    if (customHeading) {
      return {
        badgeIcon,
        badgeLabel: isCustomOccasion ? "Special Event" : (occasion || "Invitation"),
        prefix: "CORDIALLY INVITING YOU TO CELEBRATE",
        mainText: customHeading,
        highlightText: targetName && !customHeading.toLowerCase().includes(targetName.toLowerCase()) ? targetName : undefined,
        fullTitle: customHeading,
        isCustom: true,
      };
    }
    return {
      badgeIcon,
      badgeLabel: isCustomOccasion ? "Event Invitation" : (occasion || "Event Invitation"),
      prefix: `The ${isCustomOccasion ? "Celebration" : (occasion || "Celebration")} of`,
      mainText: "",
      highlightText: targetName,
      fullTitle: `The ${isCustomOccasion ? "Celebration" : (occasion || "Celebration")} of ${targetName}`,
      isCustom: false,
    };
  }

  // 2. Custom Heading provided explicitly (e.g. "A Trip to Lonavala with Team EMERGY")
  if (customHeading) {
    const hasRecipient =
      recipient &&
      !customHeading.toLowerCase().includes(recipient.toLowerCase()) &&
      recipient.toLowerCase() !== "everyone" &&
      recipient.toLowerCase() !== "team";

    return {
      badgeIcon,
      badgeLabel: isCustomOccasion ? "Special Keepsake" : (occasion || "Special Keepsake"),
      prefix: undefined,
      mainText: customHeading,
      highlightText: hasRecipient ? recipient : undefined,
      fullTitle: customHeading,
      isCustom: true,
    };
  }

  const occLower = occasion.toLowerCase();

  // 3. User entered a custom text directly as occasion (not one of the standard keys)
  const isStandard = [
    "birthday",
    "anniversary",
    "wedding",
    "farewell",
    "thank you",
    "thankyou",
    "housewarming",
    "baby shower",
    "just because",
  ].includes(occLower);

  if (!isStandard && occasion && !isCustomOccasion) {
    // E.g., occasion is "A Trip to Lonavala with Team EMERGY"
    const hasRecipient =
      recipient &&
      !occasion.toLowerCase().includes(recipient.toLowerCase()) &&
      recipient.toLowerCase() !== "everyone";

    return {
      badgeIcon,
      badgeLabel: occasion.length > 24 ? "Special Memory" : occasion,
      prefix: undefined,
      mainText: occasion,
      highlightText: hasRecipient ? recipient : undefined,
      fullTitle: occasion,
      isCustom: true,
    };
  }

  // 4. Standard Occasions with Smart Grammatical Prefixes
  switch (occLower) {
    case "birthday":
      return {
        badgeIcon: "🎂",
        badgeLabel: "Birthday",
        prefix: "Happy Birthday,",
        mainText: "",
        highlightText: recipient || "You",
        fullTitle: `Happy Birthday, ${recipient || "You"}`,
        isCustom: false,
      };

    case "anniversary":
      return {
        badgeIcon: "🥂",
        badgeLabel: "Anniversary",
        prefix: "Happy Anniversary,",
        mainText: "",
        highlightText: recipient || "You",
        fullTitle: `Happy Anniversary, ${recipient || "You"}`,
        isCustom: false,
      };

    case "wedding":
      return {
        badgeIcon: "💍",
        badgeLabel: "Wedding",
        prefix: "Celebrating the Wedding of",
        mainText: "",
        highlightText: coupleNames || recipient || "The Happy Couple",
        fullTitle: `Celebrating the Wedding of ${coupleNames || recipient || "The Happy Couple"}`,
        isCustom: false,
      };

    case "thank you":
    case "thankyou":
      return {
        badgeIcon: "🙏",
        badgeLabel: "Thank You",
        prefix: "With Sincere Gratitude & Thanks to,",
        mainText: "",
        highlightText: recipient || "You",
        fullTitle: `Thank You, ${recipient || "You"}`,
        isCustom: false,
      };

    case "farewell":
      return {
        badgeIcon: "🌿",
        badgeLabel: "Farewell",
        prefix: "Farewell & Best Wishes,",
        mainText: "",
        highlightText: recipient || "You",
        fullTitle: `Farewell & Best Wishes, ${recipient || "You"}`,
        isCustom: false,
      };

    case "housewarming":
      return {
        badgeIcon: "🏡",
        badgeLabel: "Housewarming",
        prefix: "Happy Housewarming,",
        mainText: "",
        highlightText: recipient || "You",
        fullTitle: `Happy Housewarming, ${recipient || "You"}`,
        isCustom: false,
      };

    case "baby shower":
      return {
        badgeIcon: "🍼",
        badgeLabel: "Baby Shower",
        prefix: "Celebrating the Baby Shower of,",
        mainText: "",
        highlightText: recipient || "The Little One",
        fullTitle: `Celebrating the Baby Shower of ${recipient || "The Little One"}`,
        isCustom: false,
      };

    case "just because":
      return {
        badgeIcon: "🌸",
        badgeLabel: "Just Because",
        prefix: "Thinking of You,",
        mainText: "",
        highlightText: recipient || "You",
        fullTitle: `Thinking of You, ${recipient || "You"}`,
        isCustom: false,
      };

    case "other":
    case "other (custom heading)":
    default:
      return {
        badgeIcon: "✨",
        badgeLabel: "Special Memory",
        prefix: undefined,
        mainText: recipient || "A Special Celebration",
        highlightText: undefined,
        fullTitle: recipient || "A Special Celebration",
        isCustom: true,
      };
  }
}
