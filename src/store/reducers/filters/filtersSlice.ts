import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  sortOption: string;
  priceRange: [number, number];
  appliedPriceRange: [number, number] | null;
  deliveryTime: string;
  appliedDeliveryTime: string | null;
}

const initialState: FiltersState = {
  sortOption: "popularity",
  priceRange: [0, 10000],
  appliedPriceRange: null,
  deliveryTime: "any",
  appliedDeliveryTime: null,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSortOption(state, action: PayloadAction<string>) {
      state.sortOption = action.payload;
    },
    setPriceRange(state, action: PayloadAction<[number, number]>) {
      state.priceRange = action.payload;
    },
    setAppliedPriceRange(state, action: PayloadAction<[number, number] | null>) {
      state.appliedPriceRange = action.payload;
    },
    setDeliveryTime(state, action: PayloadAction<string>) {
      state.deliveryTime = action.payload;
    },
    setAppliedDeliveryTime(state, action: PayloadAction<string | null>) {
      state.appliedDeliveryTime = action.payload;
    },
    resetFilters(state) {
      state.sortOption = "popularity";
      state.priceRange = [0, 10000];
      state.appliedPriceRange = null;
      state.deliveryTime = "any";
      state.appliedDeliveryTime = null;
    },
  },
});

export const {
  setSortOption,
  setPriceRange,
  setAppliedPriceRange,
  setDeliveryTime,
  setAppliedDeliveryTime,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;