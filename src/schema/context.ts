import UserModel from './user/model';
import OtpModel from './otp/model';
import { Transporter, createTransport } from 'nodemailer';
import CountryModel from './country/model';
import CityModel from './city/model';
import RoleModel from './role/model';
import PermissionModel from './permission/model';
import RolePermissionModel from './role-permission/model';
import CategoryModel from './category/model';
import CategoryPriceModel from './category-price/model';
import TournamentModel from './tournament/model';
import TournamentPlayerModel from './tournament-player/model';
import TableModel from './table/model';
import ShiftModel from './shift/model';
import CustomerModel from './customer/model';
import TableSessionModel from './table-session/model';
import InvoiceModel from './invoice/model';
import PaymentModel from './payment/model';
import CompanyModel from './company/model';
import TournamentRoundModel from './tournament-round/model';

export default class Context {
    static instance:Context;
    otp: OtpModel;
    user: UserModel;
    city: CityModel;
    role: RoleModel;
    category: CategoryModel;
    categoryPrice: CategoryPriceModel;
    tournament: TournamentModel;
    tournamentPlayer: TournamentPlayerModel;
    table: TableModel;
    tournamentRound: TournamentRoundModel;
    shift: ShiftModel;
    customer: CustomerModel;
    tableSession: TableSessionModel;
    invoice: InvoiceModel;
    payment: PaymentModel;
    company: CompanyModel;
    userId: string;
    schema: any;
    country: CountryModel;
    permission: PermissionModel;
    rolePermission: RolePermissionModel;
    req: object;
    transporter:Transporter;

    constructor(connection: any, schema: any, req?: any, user?: any) {
        this.otp = new OtpModel(connection, this);
        this.user = user;
        this.city = new CityModel(connection, this);
        this.role = new RoleModel(connection, this);
        this.category = new CategoryModel(connection, this);
        this.categoryPrice = new CategoryPriceModel(connection, this);
        this.tournament = new TournamentModel(connection, this);
        this.tournamentPlayer = new TournamentPlayerModel(connection, this);
        this.table = new TableModel(connection, this);
        this.tournamentRound = new TournamentRoundModel(connection, this);
        this.shift = new ShiftModel(connection, this);
        this.customer = new CustomerModel(connection, this);
        this.tableSession = new TableSessionModel(connection, this);
        this.invoice = new InvoiceModel(connection, this);
        this.payment = new PaymentModel(connection, this);
        this.company = new CompanyModel(connection, this);
        this.userId = user ? user.id : null;
        this.schema = schema;
        this.country = new CountryModel(connection, this);
        this.permission = new PermissionModel(connection, this);
        this.rolePermission = new RolePermissionModel(connection, this);
        this.transporter = createTransport({
            host: process.env.SMTP_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })
    }

    static getInstance(connection: any, schema: any, req?: any, auth?: any) {
        if (!this.instance) {
            this.instance = new Context(connection, schema, req, auth);
        }
        return this.instance;
    }

    setReq(req:any){
        this.req = req
    }

    setAuth(user:any){
        this.user = user
        this.userId = user.id
    }
}