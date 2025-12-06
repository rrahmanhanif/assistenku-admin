await supabase.from("users").delete().eq("id", uid);
