const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.PROJECT_URL,
  process.env.PROJECT_SERVICE_KEY
);

module.exports = supabase;
