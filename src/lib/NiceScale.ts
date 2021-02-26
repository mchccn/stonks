export default class NiceScale {
    public minPoint!: number;
    public maxPoint!: number;
    public maxTicks!: number;
    public spacing!: number;
    public range!: number;
    public niceMin!: number;
    public niceMax!: number;

    public constructor(min: number, max: number, maxTicks: number) {
        this.minPoint = min;
        this.maxPoint = max;
        this.maxTicks = maxTicks;
        this.calculate();
    }

    private calculate() {
        this.range = this.niceNum(this.maxPoint - this.minPoint, false);
        this.spacing = this.niceNum(this.range / (this.maxTicks - 1), true);
        this.niceMin = Math.floor(this.minPoint / this.spacing) * this.spacing;
        this.niceMax = Math.ceil(this.maxPoint / this.spacing) * this.spacing;
    }

    private niceNum(localRange: number, round: boolean) {
        let exponent;
        let fraction;
        let niceFraction;

        exponent = Math.floor(Math.log10(localRange));
        fraction = localRange / Math.pow(10, exponent);

        if (round) {
            if (fraction < 1.5) niceFraction = 1;
            else if (fraction < 3) niceFraction = 2;
            else if (fraction < 7) niceFraction = 5;
            else niceFraction = 10;
        } else {
            if (fraction <= 1) niceFraction = 1;
            else if (fraction <= 2) niceFraction = 2;
            else if (fraction <= 5) niceFraction = 5;
            else niceFraction = 10;
        }

        return niceFraction * Math.pow(10, exponent);
    }
}
