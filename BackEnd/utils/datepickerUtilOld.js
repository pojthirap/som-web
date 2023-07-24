import DateUtils from '@date-io/moment'; // choose your lib
import moment from 'moment';
import { useCookies } from "react-cookie";

export default class OverwriteMomentBE extends DateUtils{

    constructor({ locale, formats, instance }) {
        const [cookie] = useCookies()
        locale = cookie.lang ? cookie.lang : "th";
        super({ locale, formats, instance });
    }

    date = (value = null) => {
        if (value === null) {
          return null;
        }
        moment.locale(this.locale == 'th' ? 'th' : 'en-au');
        const dateMoment = this.moment(value);
        dateMoment.locale(this.locale);
        return dateMoment;
    };

    toBuddhistYear (moment, format) {
        var christianYear = moment.format('YYYY')
        var buddhishYear = (parseInt(christianYear) + (this.locale == "th" ? 543 : 0)).toString()
        return moment
            .format(format.replace('YYYY', buddhishYear).replace('YY', buddhishYear.substring(2, 4)))
            .replace(christianYear, buddhishYear)
    }

    format = (date, formatKey) => {
        return this.toBuddhistYear(date,formatKey);
    };

}
