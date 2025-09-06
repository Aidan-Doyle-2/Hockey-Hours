// app/admin.tsx
import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	Animated,
} from "react-native";
import { supabase } from "../../supabase";

export default function AdminDashboard() {
	const [teams, setTeams] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [mode, setMode] = useState<"list" | "role" | "form">("list");
	const [category, setCategory] = useState<"junior" | "senior" | null>(null);
	const [teamName, setTeamName] = useState("");
	const [gender, setGender] = useState<
		"boys" | "girls" | "mens" | "womens" | null
	>(null);

	const fadeAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		fetchTeams();
	}, []);

	const fetchTeams = async () => {
		setLoading(true);
		const { data: user } = await supabase.auth.getUser();
		if (!user?.user) return;

		const { data: club } = await supabase
			.from("clubs")
			.select("id")
			.eq("admin_id", user.user.id)
			.single();

		if (!club) return;

		const { data, error } = await supabase
			.from("teams")
			.select("*")
			.eq("club_id", club.id)
			.order("created_at", { ascending: true });

		if (error) {
			Alert.alert("Error", error.message);
		} else {
			setTeams(data || []);
		}
		setLoading(false);
	};

    const addTeam = async () => {
        console.log("➡️ addTeam called with:", { teamName, category, gender });

        if (!teamName || !category || !gender) {
            Alert.alert("Error", "Please fill out all fields");
            return;
        }

        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.error("❌ getUser error:", userError);
            return;
        }
        if (!user?.user) {
            console.error("❌ No authenticated user");
            return;
        }

        const { data: club, error: clubError } = await supabase
            .from("clubs")
            .select("id")
            .eq("admin_id", user.user.id)
            .single();

        if (clubError) {
            console.error("❌ Club fetch error:", clubError);
            Alert.alert("Error", clubError.message);
            return;
        }
        if (!club) {
            console.error("❌ No club found for this admin");
            Alert.alert("Error", "Club not found");
            return;
        }

        console.log("✅ Found club:", club);

        const { error: insertError } = await supabase.from("teams").insert([
            {
                club_id: club.id,
                name: teamName,
                category,
                gender,
            },
        ]);

        if (insertError) {
            console.error("❌ Supabase insert error:", insertError);
            Alert.alert("Error", insertError.message);
        } else {
            console.log("✅ Team saved successfully:", {
                club_id: club.id,
                name: teamName,
                category,
                gender,
            });
            Alert.alert("✅ Success", "Team created");
            setTeamName("");
            setCategory(null);
            setGender(null);
            switchScreen(() => setMode("list"));
            fetchTeams();
        }
    };


	const switchScreen = (next: () => void) => {
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start(() => {
			next();
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();
		});
	};

	const renderRoleChoice = () => (
		<View style={styles.centered}>
			<Text style={styles.subtitle}>Is this team Junior or Senior?</Text>
			<View style={styles.choiceRow}>
				<TouchableOpacity
					style={styles.choiceBubble}
					onPress={() =>
						switchScreen(() => {
							setCategory("junior");
							setMode("form");
						})
					}
				>
					<Text style={styles.choiceText}>Junior</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.choiceBubble}
					onPress={() =>
						switchScreen(() => {
							setCategory("senior");
							setMode("form");
						})
					}
				>
					<Text style={styles.choiceText}>Senior</Text>
				</TouchableOpacity>
			</View>
			<TouchableOpacity onPress={() => switchScreen(() => setMode("list"))}>
				<Text style={styles.link}>⬅ Back to Teams</Text>
			</TouchableOpacity>
		</View>
	);

	const renderForm = () => (
		<View style={styles.centered}>
			<Text style={styles.subtitle}>
				{category === "junior" ? "Junior Team" : "Senior Team"}
			</Text>

			{/* JUNIOR FIELDS */}
			{category === "junior" && (
				<View style={styles.choiceRow}>
					<TouchableOpacity
						style={[
							styles.choiceBubbleSmall,
							gender === "boys" && { backgroundColor: "#3b82f6" },
						]}
						onPress={() => setGender("boys")}
					>
						<Text
							style={[
								styles.choiceText,
								gender === "boys" && { color: "#fff" },
							]}
						>
							Boys
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.choiceBubbleSmall,
							gender === "girls" && { backgroundColor: "#3b82f6" },
						]}
						onPress={() => setGender("girls")}
					>
						<Text
							style={[
								styles.choiceText,
								gender === "girls" && { color: "#fff" },
							]}
						>
							Girls
						</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* SENIOR FIELDS */}
			{category === "senior" && (
				<View style={styles.choiceRow}>
					<TouchableOpacity
						style={[
							styles.choiceBubbleSmall,
							gender === "mens" && { backgroundColor: "#3b82f6" },
						]}
						onPress={() => setGender("mens")}
					>
						<Text
							style={[
								styles.choiceText,
								gender === "mens" && { color: "#fff" },
							]}
						>
							Mens
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.choiceBubbleSmall,
							gender === "womens" && { backgroundColor: "#3b82f6" },
						]}
						onPress={() => setGender("womens")}
					>
						<Text
							style={[
								styles.choiceText,
								gender === "womens" && { color: "#fff" },
							]}
						>
							Womens
						</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* COMMON TEAM NAME INPUT */}
			<TextInput
				style={styles.input}
				placeholder="Team Name"
				value={teamName}
				onChangeText={setTeamName}
			/>
			{category === "junior" ? (
				<Text style={styles.helper}>
					We recommend using standard categories like U10, U14, U18.
				</Text>
			) : (
				<Text style={styles.helper}>
					We suggest naming teams like 1st XI, 2nd XI, 3rd XI.
				</Text>
			)}

			<TouchableOpacity style={styles.button} onPress={addTeam}>
				<Text style={styles.buttonText}>Save Team</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.button, { backgroundColor: "#aaa" }]}
				onPress={() => switchScreen(() => setMode("role"))}
			>
				<Text style={styles.buttonText}>Back</Text>
			</TouchableOpacity>
		</View>
	);

	const renderList = () => {
		const juniorBoys = teams
			.filter((t) => t.category === "junior" && t.gender === "boys")
			.sort((a, b) => a.name.localeCompare(b.name));

		const juniorGirls = teams
			.filter((t) => t.category === "junior" && t.gender === "girls")
			.sort((a, b) => a.name.localeCompare(b.name));

		const seniorMens = teams
			.filter((t) => t.category === "senior" && t.gender === "mens")
			.sort((a, b) => a.name.localeCompare(b.name));

		const seniorWomens = teams
			.filter((t) => t.category === "senior" && t.gender === "womens")
			.sort((a, b) => a.name.localeCompare(b.name));

		return (
			<View style={{ flex: 1 }}>
				<Text style={styles.title}>⚙️ Admin Dashboard</Text>
				{loading ? (
					<Text>Loading teams...</Text>
				) : (
					<>
						<Text style={styles.sectionTitle}>Junior Boys</Text>
						{juniorBoys.length === 0 ? (
							<Text style={styles.emptyText}>No teams yet</Text>
						) : (
							juniorBoys.map((t) => (
								<View key={t.id} style={styles.team}>
									<Text style={styles.teamName}>{t.name}</Text>
								</View>
							))
						)}

						<Text style={styles.sectionTitle}>Junior Girls</Text>
						{juniorGirls.length === 0 ? (
							<Text style={styles.emptyText}>No teams yet</Text>
						) : (
							juniorGirls.map((t) => (
								<View key={t.id} style={styles.team}>
									<Text style={styles.teamName}>{t.name}</Text>
								</View>
							))
						)}

						<Text style={styles.sectionTitle}>Senior Mens</Text>
						{seniorMens.length === 0 ? (
							<Text style={styles.emptyText}>No teams yet</Text>
						) : (
							seniorMens.map((t) => (
								<View key={t.id} style={styles.team}>
									<Text style={styles.teamName}>{t.name}</Text>
								</View>
							))
						)}

						<Text style={styles.sectionTitle}>Senior Womens</Text>
						{seniorWomens.length === 0 ? (
							<Text style={styles.emptyText}>No teams yet</Text>
						) : (
							seniorWomens.map((t) => (
								<View key={t.id} style={styles.team}>
									<Text style={styles.teamName}>{t.name}</Text>
								</View>
							))
						)}
					</>
				)}
				<TouchableOpacity
					style={styles.button}
					onPress={() => switchScreen(() => setMode("role"))}
				>
					<Text style={styles.buttonText}>+ Add New Team</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Animated.View style={{ flex: 1, opacity: fadeAnim, width: "100%" }}>
				{mode === "list" && renderList()}
				{mode === "role" && renderRoleChoice()}
				{mode === "form" && renderForm()}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: "#fff" },
	title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, marginTop: 20 },
	sectionTitle: { fontSize: 20, fontWeight: "600", marginTop: 20, marginBottom: 8 },
	team: {
		backgroundColor: "#f3f4f6",
		padding: 14,
		marginBottom: 10,
		borderRadius: 8,
	},
	teamName: { fontSize: 18, fontWeight: "600" },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	subtitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
	choiceRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
	choiceBubble: {
		backgroundColor: "#e0f2fe",
		padding: 30,
		borderRadius: 50,
		width: 140,
		alignItems: "center",
		marginHorizontal: 10,
	},
	choiceBubbleSmall: {
		backgroundColor: "#e0f2fe",
		padding: 20,
		borderRadius: 40,
		width: 120,
		alignItems: "center",
		marginHorizontal: 10,
		marginBottom: 15,
	},
	choiceText: { fontSize: 18, fontWeight: "bold", color: "#111" },
	link: { marginTop: 20, color: "#3b82f6", fontSize: 16 },
	input: {
		backgroundColor: "#f9fafb",
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 14,
		borderRadius: 8,
		marginBottom: 6,
		width: "80%",
	},
	helper: {
		fontSize: 12,
		color: "#6b7280",
		marginBottom: 12,
		textAlign: "center",
		width: "80%",
	},
	button: {
		backgroundColor: "#3b82f6",
		padding: 14,
		borderRadius: 8,
		marginTop: 10,
		width: "80%",
	},
	buttonText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 16 },
	emptyText: {
		fontSize: 14,
		color: "#6b7280",
		marginBottom: 10,
		fontStyle: "italic",
		textAlign: "center",
	},
});
