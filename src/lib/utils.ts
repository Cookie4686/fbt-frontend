import type { RequestEvent } from "@sveltejs/kit";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function getFormData(event: RequestEvent) {
	const formData = await event.request.formData();
	return Object.fromEntries(formData.entries());
}

type PickNullable<T> = {
	[P in keyof T as null extends T[P] ? P : never]: T[P];
};

type PickNotNullable<T> = {
	[P in keyof T as null extends T[P] ? never : P]: T[P];
};

export type OptionalNullable<T> = {
	[K in keyof PickNullable<T>]?: T[K];
} & {
	[K in keyof PickNotNullable<T>]: T[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
