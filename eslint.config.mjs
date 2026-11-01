import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: ["src/modules/*/domain/**/*.{ts,tsx}", "src/shared/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/modules/*/presentation/*",
                "react",
                "react/*",
                "next",
                "next/*",
              ],
              message: "도메인 계층에서는 UI와 프레임워크를 가져올 수 없습니다.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}", "tests/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  globalIgnores([".next/**", "coverage/**", "playwright-report/**", "test-results/**"]),
]);
