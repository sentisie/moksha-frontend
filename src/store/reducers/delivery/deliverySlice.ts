import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IDeliveryInfo, ILocation } from "../../../types/types";

const savedDeliveryMode = localStorage.getItem("deliveryMode") as
	| "pickup"
	| "courier"
	| null;
const savedDeliverySpeed = localStorage.getItem("deliverySpeed") as
	| "regular"
	| "fast"
	| null;

const initialState: IDeliveryInfo = {
	location: JSON.parse(localStorage.getItem("userLocation") || "null"),
	zone_id: parseInt(localStorage.getItem("zoneId") || "1"),
	selectedItems: JSON.parse(localStorage.getItem("selectedCartItems") || "[]"),
	deliveryCost: parseFloat(localStorage.getItem("deliveryCost") || "0"),
	deliveryMode: savedDeliveryMode || "pickup",
	deliverySpeed: savedDeliverySpeed || "regular",
};

export const deliverySlice = createSlice({
	name: "delivery",
	initialState,
	reducers: {
		setLocation: (state, action: PayloadAction<{ location: ILocation; zone_id: number }>) => {
			state.location = action.payload.location;
			state.zone_id = action.payload.zone_id;
			localStorage.setItem("userLocation", JSON.stringify(action.payload.location));
			localStorage.setItem("zoneId", action.payload.zone_id.toString());

			state.deliveryMode = action.payload.location.deliveryMode;
			state.deliverySpeed = action.payload.location.deliverySpeed || null;

			localStorage.setItem("deliveryMode", state.deliveryMode);
			if (state.deliverySpeed) {
				localStorage.setItem("deliverySpeed", state.deliverySpeed);
			} else {
				localStorage.removeItem("deliverySpeed");
			}

			state.deliveryCost = state.deliveryMode === "courier" ? 320 : 0;
			localStorage.setItem("deliveryCost", state.deliveryCost.toString());
		},
		toggleItemSelection: (state, action: PayloadAction<number>) => {
			const index = state.selectedItems.indexOf(action.payload);
			if (index !== -1) {
				state.selectedItems.splice(index, 1);
			} else {
				state.selectedItems.push(action.payload);
			}
			localStorage.setItem(
				"selectedCartItems",
				JSON.stringify(state.selectedItems)
			);
		},
		selectAllItems: (state, action: PayloadAction<number[]>) => {
			state.selectedItems = action.payload;
			localStorage.setItem("selectedCartItems", JSON.stringify(action.payload));
		},
		clearSelectedItems: (state) => {
			state.selectedItems = [];
			localStorage.setItem("selectedCartItems", "[]");
		},
		setDeliverySpeed: (state, action: PayloadAction<"regular" | "fast">) => {
			state.deliverySpeed = action.payload;
			localStorage.setItem("deliverySpeed", action.payload);
		},
		removeItemSelection: (state, action: PayloadAction<number>) => {
			state.selectedItems = state.selectedItems.filter(
				(id) => id !== action.payload
			);
			localStorage.setItem(
				"selectedCartItems",
				JSON.stringify(state.selectedItems)
			);
		},
		setSelectedItems: (state, action: PayloadAction<number[]>) => {
			state.selectedItems = action.payload;
			localStorage.setItem(
				"selectedCartItems",
				JSON.stringify(state.selectedItems)
			);
		},
	},
});

export const {
	setLocation,
	toggleItemSelection,
	selectAllItems,
	clearSelectedItems,
	setDeliverySpeed,
	removeItemSelection,
	setSelectedItems,
} = deliverySlice.actions;

export default deliverySlice.reducer;
