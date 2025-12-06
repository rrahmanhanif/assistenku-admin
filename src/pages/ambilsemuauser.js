const { data } = await supabase.from("users").select("*");
