// Central settings for the Teen Patti Pro landing site.
// Edit these values, then run `node build.mjs` to regenerate /dist.

export default {
  // Live domain, no trailing slash. Used for canonical URLs, sitemap, Open Graph and schema.
  siteUrl: "https://theteenpattipro.com",

  siteName: "Teen Patti Pro",
  appName: "Teen Patti Pro",
  language: "en-IN",
  locale: "en_IN",
  twitterHandle: "",

  // Where every "Download APK" button points. Use an absolute URL or a path inside /dist.
  downloadUrl: "/download/teen-patti-pro.apk",
  apkFileName: "teen-patti-pro.apk",

  // App facts shown in the specs table and schema. Leave a value empty ("") to hide its row.
  // Only publish numbers you can verify.
  app: {
    version: "",          // e.g. "1.0.5"
    size: "",             // e.g. "64 MB"
    minAndroid: "",       // e.g. "Android 5.0+"
    developer: "",        // e.g. "Teen Patti Pro Studio"
    category: "Card & Casino Games",
    license: "Free",
    languages: "English",
    lastUpdated: "2026-10-03",
  },

  // Optional genuine store rating. Keep null unless the numbers come from a real, public source
  // (Google penalises made-up ratings). Example: { value: 4.3, count: 1520 }
  rating: null,

  // Contact address shown on the privacy / contact sections.
  contactEmail: "support@theteenpattipro.com",

  // Blog posts per page on /blog/.
  postsPerPage: 9,
};
