// Adding all global constants here
export class GlobalConstants {

    //Common
    public static weekdays: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


    //Group Expense
    public static groupExpenseTypes: string[] = ["Court", "Shuttle", "Donation", "Tech Subscription", "Other"];
    public static groupValidPeriodInYears: number = 3; // group default to 3 years



    //BOOKING
    public static bookingOpenDay: string = "Monday";
    public static bookingOpenTime: string = "6:00AM";
    public static bookingWithdrawHours: number = 4; //can't withdraw 3 hours before the session starts
    // public static tueSeats: number = 16;
    // public static friSeats: number = 42;
    // public static satSeats: number = 34;

    //public static autoBookingFee: number = 10; //$10 for setting up auto booking
    public static paymentCredit: string = "Credit";
    public static paymentCash: string = "Cash";
    public static paymentBank: string = "Bank";
    public static paymentAdjust: string = "Adjust"; //used by admin only, when make adjustment to group income


    //Auto Booking
    public static autoBookingRates = [
        { name: '2 months ($5)', value: 2, price: 5, desc: '2 months auto booking for $5' },
        { name: '6 months ($10)', value: 6, price: 10, desc: '6 months auto booking for $10' },
    ]


    //Price, Rates
    public static rateCash: number = 17;
    public static rateCredit: number = 15;
    public static rateFamily: number = 14; //1 person charge 15, the rest 14 each

    //EVENTS for Audit table
    public static eventbookingWithdraw: string = "social booking withdraw";
    public static eventBooking: string = "social booking";
    public static eventTopupCredit: string = "credit topup";
    public static eventPasswordChange: string = "password change";
    public static eventProfileChange: string = "profile change";
    public static eventAutoBooking: string = "auto booking schedule";
    public static eventAutoBookingCancel: string = "auto booking schedule cancel";
    public static eventFamilyMember: string = "family member change";
    public static eventWebActivity: string = "login/web activity"; //for user is browsing the website





}