const axios = require("axios");
const { getAirtableEntries, patchRecord } = require("./lib/airtable");
const { parseHTML } = require("linkedom");

async function urlReadingTime(url) {
  const { data: page } = await axios.get(url, { timeout: 5000 });
  const { document } = parseHTML(page);
  const text = document.querySelector("body").innerText;
  const wordCount = text.match(/\S+/g).length;

  const readingTime = Math.round(wordCount / 300);
  return readingTime;
}

async function main() {
  const entries = await getAirtableEntries(null, "Content");
  const idToReadingTime = {};
  await Promise.all(
    entries.map(async (entry) => {
      if (entry["Reading time"]) {
        return;
      }
      try {
        idToReadingTime[entry.id] = await urlReadingTime(entry.URL);
      } catch (e) {
        console.log(`Error ${entry.URL} >> ${e}`);
      }
    })
  );

  const updateEntries = Object.entries(idToReadingTime).map(
    ([id, readingTime]) => ({
      id,
      fields: { ["Reading time"]: readingTime },
    })
  );
  console.log(`Got reading time for ${updateEntries.length}`);
  for (entry of updateEntries) {
    console.log(`Updating ${entry.id}`);
    await patchRecord(entry, "Content");
  }
}

main();
