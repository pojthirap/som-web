import DateUtils from '@date-io/date-fns'; // choose your lib
import moment from 'moment';

export default class OverwriteMomentBE extends DateUtils{

    constructor({ locale}) {
        super({ locale});
    }

    toBuddhistYear (date, format) {
        var mDate= moment(date)
        mDate.locale(this.locale.code)
        var christianYear = mDate.format('YYYY')
        var buddhishYear = (parseInt(christianYear) + (this.locale.code == "th" ? 543 : 0)).toString()
        return mDate
            .format(format.replace('YYYY', buddhishYear).replace('YY', buddhishYear.substring(2, 4)))
            .replace(christianYear, buddhishYear)
    }

    format = (date, formatKey) => {
        var mformatKey = formatKey.toUpperCase().replace("EEE","ddd").replace("EEE","")
        return this.toBuddhistYear(date,mformatKey);
    };
}
