type RequestInput<T> = Omit<T, "$typeName" | "$unknown">;
