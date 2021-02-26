const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

const { AIRTABLE_API_KEY, AIRTABLE_BASE } = process.env;

async function getAirtableEntries(offset, table, view = "Ready") {
  const { data } = await axios.get(
    `https://api.airtable.com/v0/${AIRTABLE_BASE}/${table}?view=${view}&maxRecords=100${
      offset ? `&offset=${offset}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      }
    }
  ).catch(err => { console.error(err.response); throw error; });

  const entries = data.records.map((r) =>
    Object.assign(r.fields, { id: r.id })
  );
  if (data.offset) {
    return entries.concat(await getAirtableEntries(data.offset, table, view));
  } else {
    return entries;
  }
}

async function patchRecord(record, table) {
  await axios.patch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE}/${table}`,
    {
      records: [record],
    },
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );
}

module.exports = {
  getAirtableEntries,
  patchRecord,
};
