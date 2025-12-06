await supabase.from("users").update({ fullname }).eq("id", uid);
