import { InMemoryFoodRepository } from "@/modules/foods/application/food-repository";

// 운영 데이터 연결은 사람 승인 이후 별도 adapter로 교체한다. 현재 공개 데이터는 의도적으로 비어 있다.
export const foodRepository = new InMemoryFoodRepository();
