export class DateUtils {

  /**
   * 将时间戳转换为格式化的字符串 (YYYY-MM-DD-HH-mm-ss)
   * @param time 时间戳（毫秒）
   * @returns 格式化的时间字符串
   */
  public static timeToString(time: number): string {
    if (typeof time !== 'number' || isNaN(time) || !isFinite(time)) {
      throw new Error('Invalid timestamp: must be a finite number');
    }

    const date = new Date(time);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp: cannot convert to valid Date');
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
  }

  /**
   * 将格式化的字符串 (YYYY-MM-DD-HH-mm-ss) 转换为时间戳
   * @param time 格式化的时间字符串
   * @returns 时间戳（毫秒）
   */
  public static stringToTime(time: string): number {
    if (typeof time !== 'string') {
      throw new Error('Input must be a string');
    }

    const parts = time.split('-');
    if (parts.length !== 6) {
      throw new Error('Invalid format: must be YYYY-MM-DD-HH-mm-ss');
    }

    // 验证所有部分都是数字
    if (parts.some(part => !/^\d+$/.test(part))) {
        throw new Error('All components must be numeric');
    }

    const [yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = parts;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const second = parseInt(secondStr, 10);

    // 验证各部分的数值范围
    if (month < 1 || month > 12) throw new Error('Month must be between 01-12');
    if (day < 1 || day > 31) throw new Error('Day must be between 01-31');
    if (hour < 0 || hour > 23) throw new Error('Hour must be between 00-23');
    if (minute < 0 || minute > 59) throw new Error('Minute must be between 00-59');
    if (second < 0 || second > 59) throw new Error('Second must be between 00-59');

    // 使用 UTC 时间创建日期对象
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    
    // 验证生成的日期是否与输入一致（防止无效日期如 2月30日）
    const isValidDate = (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day &&
      date.getUTCHours() === hour &&
      date.getUTCMinutes() === minute &&
      date.getUTCSeconds() === second
    );

    if (!isValidDate || isNaN(date.getTime())) {
      throw new Error('Invalid date (e.g. February 30th or similar)');
    }

    return date.getTime();
  }

}