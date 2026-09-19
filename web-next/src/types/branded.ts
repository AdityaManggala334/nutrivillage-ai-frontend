/**
 * branded.ts
 * Branded Types: membungkus `string` dengan penanda unik agar ID antar-entitas
 * tidak tertukar (mis. RecipeId tidak bisa diisi UserId) meski sama-sama string.
 */

declare const __brand: unique symbol;

type Brand<TValue, TBrand extends string> = TValue & { readonly [__brand]: TBrand };

export type UserId = Brand<string, "UserId">;
export type RecipeId = Brand<string, "RecipeId">;
export type RecommendationId = Brand<string, "RecommendationId">;
export type MealPlanId = Brand<string, "MealPlanId">;
export type ShoppingListId = Brand<string, "ShoppingListId">;

export const toUserId = (value: string): UserId => value as UserId;
export const toRecipeId = (value: string): RecipeId => value as RecipeId;
export const toRecommendationId = (value: string): RecommendationId => value as RecommendationId;
export const toMealPlanId = (value: string): MealPlanId => value as MealPlanId;
export const toShoppingListId = (value: string): ShoppingListId => value as ShoppingListId;
