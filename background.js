// Service Worker for the extension
// Currently minimal - can be extended for additional features

chrome.runtime.onInstalled.addListener(() => {
  console.log("Cookie Extractor extension installed");
});
