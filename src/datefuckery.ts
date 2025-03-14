import { DateTime } from "luxon";

export function today() {
    return DateTime.now().toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
}