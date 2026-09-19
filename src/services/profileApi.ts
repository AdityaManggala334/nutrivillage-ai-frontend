import { familyProfileFormSchema } from '../schemas/profileSchema';
import { type FamilyProfile, type UserId, toFamilyMemberId } from '../types/domain';
import { type AsyncState, asyncError, asyncSuccess } from '../types/state';
import { STORAGE_KEYS, createId, delay, readJson, removeKey, writeJson } from './storage';

export const getStoredProfile = (): FamilyProfile | null =>
  readJson<FamilyProfile | null>(STORAGE_KEYS.profile, null);

export const clearProfile = (): void => {
  removeKey(STORAGE_KEYS.profile);
};

/** Mock API simpan data keluarga (FR-05). Menerima input mentah lalu memvalidasi dengan Zod. */
export const saveFamilyProfile = async (
  userId: UserId,
  input: unknown,
): Promise<AsyncState<FamilyProfile>> => {
  const parsed = familyProfileFormSchema.safeParse(input);
  if (!parsed.success) {
    return asyncError('Data keluarga belum valid. Periksa kembali isian Anda.', false);
  }

  await delay(900);

  const profile: FamilyProfile = {
    userId,
    dailyBudget: parsed.data.dailyBudget,
    region: parsed.data.region,
    members: parsed.data.members.map((member) => ({
      id: toFamilyMemberId(createId('member')),
      name: member.name,
      age: member.age,
      ageGroup: member.ageGroup,
      gender: member.gender,
      weightKg: member.weightKg,
      activityLevel: member.activityLevel,
      allergies: member.allergies,
    })),
    preferences: parsed.data.preferences,
    avoidedIngredients: parsed.data.avoidedIngredients,
    onboarded: true,
    updatedAt: new Date().toISOString(),
  };

  writeJson(STORAGE_KEYS.profile, profile);
  return asyncSuccess(profile);
};
