import { customType } from "drizzle-orm/pg-core"

type NumericConfig = {
	precision?: number
	scale?: number
}

export const customTypeNumeric = customType<{
	data: number
	driverData: string
	config: NumericConfig
}>({
	dataType: (config) => {
		if (config?.precision && config?.scale) {
			return `numeric(${config.precision}, ${config.scale})`
		}
		return 'numeric'
	},
	fromDriver: (value: string) => Number.parseFloat(value), // note: precision loss for very large/small digits so area to refactor if needed
	toDriver: (value: number) => value.toString(),
})
