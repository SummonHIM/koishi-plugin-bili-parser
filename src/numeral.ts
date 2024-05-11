import { Config } from ".";

export default function numeral(number: number, config: Config) {
  if (config.useNumeral) {
    if (number >= 10000 && number < 100000000) {
      return (number / 10000).toFixed(1) + "万";
    } else if (number >= 100000000) {
      return (number / 100000000).toFixed(1) + "亿";
    } else {
      return number.toString();
    }
  } else {
    return number;
  }
}
