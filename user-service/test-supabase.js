import supabase from "./supabaseClient.js";

async function testConnection() {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("❌ Supabase connection failed:", error);
  } else {
    console.log("✅ Supabase connected! Total users:", data.users.length);
  }
}

testConnection();
