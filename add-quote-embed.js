const { getAirtableEntries, patchRecord } = require('./lib/airtable');
const { mdTweetEmbed } = require('md-tweet-embed');

async function main() {
  const entries = await getAirtableEntries(undefined, 'Quotes');
  const idToMdEmbed = {};
  await Promise.all(entries.map(async (entry) => {
    if (entry['Markdown Embed']) {
      return;
    }
    try {
      const [embed] = await mdTweetEmbed([entry.url]);
      idToMdEmbed[entry.id] = embed;
    } catch (e) {
      console.log(`Error ${entry.url} >> ${e}`)
    }
  }));

  const updateEntries = Object.entries(idToMdEmbed).map(([id, embed]) => ({
    id, fields: { ['Markdown Embed']: embed }
  }));
  console.log(`Got embeds for ${updateEntries.length}`);
  for (entry of updateEntries) {
    console.log(`Updating ${entry.id}`)
    await patchRecord(entry, 'Quotes');
  }
}

main();
