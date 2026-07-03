import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from "../components/Screen";
import { businessRepository } from "../features/business/businessRepository";
import { restaurantsRepository } from "../repositories/restaurantsRepository";
import type {
    BusinessWithMembership,
    RestaurantCatalogItem,
} from "../repositories/types";
import { theme } from "../theme";

type ClaimRestaurantScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export function ClaimRestaurantScreen({
  navigation,
}: ClaimRestaurantScreenProps) {
  const [businesses, setBusinesses] = useState<BusinessWithMembership[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  );
  const [restaurants, setRestaurants] = useState<RestaurantCatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [claimMessage, setClaimMessage] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<
    "selectBusiness" | "selectPlace" | "confirm"
  >("selectBusiness");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        const myBusinesses = await businessRepository.getMyBusinesses();
        const ownerBusinesses = myBusinesses.filter(
          (b) => b.membership?.role === "owner",
        );
        setBusinesses(ownerBusinesses);

        if (ownerBusinesses.length === 1) {
          setSelectedBusinessId(ownerBusinesses[0].id);
        }

        const catalog = await restaurantsRepository.getCatalogItems();
        setRestaurants(catalog);
        setLoading(false);
      };
      void load();
    }, []),
  );

  const filteredRestaurants = restaurants.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.city?.toLowerCase() ?? "").includes(q) ||
      (r.cuisine?.toLowerCase() ?? "").includes(q)
    );
  });

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  const handleNext = () => {
    if (step === "selectBusiness") {
      if (!selectedBusinessId) {
        Alert.alert("Required", "Please select a business.");
        return;
      }
      setStep("selectPlace");
    } else if (step === "selectPlace") {
      if (!selectedPlaceId) {
        Alert.alert("Required", "Please select a restaurant to claim.");
        return;
      }
      setStep("confirm");
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedBusinessId || !selectedPlaceId) return;

    setSubmitting(true);
    try {
      await businessRepository.createPlaceClaim({
        businessAccountId: selectedBusinessId,
        placeId: selectedPlaceId,
        claimMessage: claimMessage.trim() || undefined,
      });

      Alert.alert(
        "Claim Submitted",
        "Your claim has been submitted for admin review.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit claim.";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (businesses.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.emptyCard}>
          <Ionicons
            name="business-outline"
            size={48}
            color={theme.colors.mutedText}
          />
          <Text style={styles.emptyTitle}>No Owner Business</Text>
          <Text style={styles.emptyText}>
            You need to be an owner of a business to claim restaurants. Register
            a business first.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("BusinessRegistration" as never)}
          >
            <Text style={styles.primaryButtonText}>Register Business</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Step indicator */}
      <View style={styles.stepRow}>
        {(["selectBusiness", "selectPlace", "confirm"] as const).map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, step === s && styles.stepDotActive]}>
              <Text
                style={[
                  styles.stepDotText,
                  step === s && styles.stepDotTextActive,
                ]}
              >
                {i + 1}
              </Text>
            </View>
            <Text
              style={[styles.stepLabel, step === s && styles.stepLabelActive]}
            >
              {i === 0 ? "Business" : i === 1 ? "Place" : "Confirm"}
            </Text>
          </View>
        ))}
      </View>

      {/* Step 1: Select Business */}
      {step === "selectBusiness" && (
        <>
          <Text style={styles.heading}>Select Your Business</Text>
          <View style={styles.businessList}>
            {businesses.map((b) => (
              <Pressable
                key={b.id}
                style={[
                  styles.businessCard,
                  selectedBusinessId === b.id && styles.businessCardActive,
                ]}
                onPress={() => setSelectedBusinessId(b.id)}
              >
                <Ionicons
                  name={
                    selectedBusinessId === b.id
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    selectedBusinessId === b.id
                      ? theme.colors.primary
                      : theme.colors.mutedText
                  }
                />
                <View style={styles.businessInfo}>
                  <Text style={styles.businessName}>{b.name}</Text>
                  <Text style={styles.businessStatus}>
                    {b.status === "active" ? "✓ Active" : "Pending approval"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Step 2: Select Place */}
      {step === "selectPlace" && (
        <>
          <Text style={styles.heading}>Find Your Restaurant</Text>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={theme.colors.mutedText}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search restaurants..."
              placeholderTextColor={theme.colors.mutedText}
            />
          </View>

          <View style={styles.restaurantList}>
            {filteredRestaurants.slice(0, 30).map((r) => (
              <Pressable
                key={r.id}
                style={[
                  styles.restaurantCard,
                  selectedPlaceId === r.id && styles.restaurantCardActive,
                ]}
                onPress={() => setSelectedPlaceId(r.id)}
              >
                <Ionicons
                  name={
                    selectedPlaceId === r.id
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    selectedPlaceId === r.id
                      ? theme.colors.primary
                      : theme.colors.mutedText
                  }
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{r.name}</Text>
                  <Text style={styles.restaurantCity}>
                    {r.city}
                    {r.cuisine ? ` · ${r.cuisine}` : ""}
                  </Text>
                </View>
              </Pressable>
            ))}
            {filteredRestaurants.length === 0 && (
              <Text style={styles.noResults}>
                No restaurants match your search.
              </Text>
            )}
          </View>
        </>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && (
        <>
          <Text style={styles.heading}>Confirm Your Claim</Text>
          <View style={styles.confirmCard}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Business</Text>
              <Text style={styles.confirmValue}>{selectedBusiness?.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Restaurant</Text>
              <Text style={styles.confirmValue}>
                {restaurants.find((r) => r.id === selectedPlaceId)?.name}
              </Text>
            </View>

            <View style={styles.messageGroup}>
              <Text style={styles.messageLabel}>Message (optional)</Text>
              <TextInput
                style={styles.messageInput}
                value={claimMessage}
                onChangeText={setClaimMessage}
                placeholder="Explain your connection to this restaurant..."
                placeholderTextColor={theme.colors.mutedText}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>
          </View>
        </>
      )}

      {/* Navigation buttons */}
      <View style={styles.buttonRow}>
        {step !== "selectBusiness" && (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              if (step === "selectPlace") setStep("selectBusiness");
              else if (step === "confirm") setStep("selectPlace");
            }}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        )}

        {step !== "confirm" ? (
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.nextButton, submitting && styles.nextButtonDisabled]}
            onPress={handleSubmitClaim}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.surface} />
            ) : (
              <Text style={styles.nextButtonText}>Submit Claim</Text>
            )}
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginTop: 25,
  },
  stepItem: {
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepDotText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  stepDotTextActive: {
    color: theme.colors.surface,
  },
  stepLabel: {
    color: theme.colors.mutedText,
    fontSize: 11,
    fontWeight: "600",
  },
  stepLabelActive: {
    color: theme.colors.heading,
  },
  heading: {
    marginTop: 30,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: "900",
  },
  businessList: {
    marginTop: 16,
    gap: 10,
  },
  businessCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  businessCardActive: {
    borderColor: "rgba(255,31,61,0.4)",
    backgroundColor: "rgba(255,31,61,0.08)",
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: "700",
  },
  businessStatus: {
    marginTop: 2,
    color: theme.colors.mutedText,
    fontSize: 12,
  },
  searchBox: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 15,
  },
  restaurantList: {
    marginTop: 16,
    gap: 8,
  },
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  restaurantCardActive: {
    borderColor: "rgba(255,31,61,0.4)",
    backgroundColor: "rgba(255,31,61,0.08)",
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    color: theme.colors.heading,
    fontSize: 15,
    fontWeight: "600",
  },
  restaurantCity: {
    marginTop: 2,
    color: theme.colors.mutedText,
    fontSize: 12,
  },
  noResults: {
    color: theme.colors.mutedText,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  confirmCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 16,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confirmLabel: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
  confirmValue: {
    color: theme.colors.heading,
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
  messageGroup: {
    gap: 8,
  },
  messageLabel: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: "600",
  },
  messageInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.heading,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.heading,
    fontSize: 15,
    fontWeight: "700",
  },
  nextButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  emptyCard: {
    marginTop: 25,
    padding: 40,
    borderRadius: 30,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  emptyTitle: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: "900",
  },
  emptyText: {
    color: theme.colors.mutedText,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  primaryButton: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "800",
  },
});
