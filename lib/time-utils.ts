/**
 * Converts time (hours and minutes) to a percentage of the day (0-100%)
 * @param hours - Hour of the day (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Percentage of the day (0-100)
 */
export const timeToPercent = (hours: number, minutes: number = 0): number => {
	return (hours / 24) * 100 + (minutes / 60 / 24) * 100;
};

/**
 * Gets the current time as a percentage of the day
 * @returns Current time as percentage (0-100)
 */
export const getCurrentTimePercent = (): number => {
	const now = new Date();
	return timeToPercent(now.getHours(), now.getMinutes());
};

/**
 * Converts a time string (e.g., "14:30") to a percentage
 * @param timeString - Time in format "HH:MM"
 * @returns Percentage of the day (0-100)
 */
export const timeStringToPercent = (timeString: string): number => {
	const [hours, minutes] = timeString.split(":").map(Number);
	return timeToPercent(hours, minutes);
};

export const dateCountUntillTodayToPercent = (date: Date): number => {
	const now = new Date();
	const totalDuration = date.getTime() - now.getTime();
	const elapsedDuration = now.getTime() - date.getTime();
	return (elapsedDuration / totalDuration) * 100;
};

export const dayCountUntillToday = (date: Date): string => {
	const now = new Date();
	const diff = date.getTime() - now.getTime();

	if (diff <= 0) return "Overdue";

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	const parts = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	parts.push(`${minutes}min`);

	return parts.join(" ");
};
