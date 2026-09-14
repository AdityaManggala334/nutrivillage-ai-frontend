import { ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Recipe } from "@/schemas/domain";

export interface RecipeStepsProps {
  readonly recipe: Recipe;
}

/** FR-11: langkah memasak. React Server Component. */
export function RecipeSteps({ recipe }: RecipeStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="size-4 text-brand-600" aria-hidden="true" /> Cara Memasak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {recipe.cookingSteps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-stone-700 dark:text-stone-200">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {index + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
