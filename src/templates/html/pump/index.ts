export const getPumpTemplate = (data: any) => {

    const hp = data.systemCapacity || "1 HP";

    const config: any = {
        "0.5 HP": {
            cost: "46,860",
            panelQty: "1 NOS",
            motor: "0.5 HP SOLAR WATER PUMP and Motor",
            controller: "1 HP Solar Water Pump Controller"
        },

        "1 HP": {
            cost: "81,720",
            panelQty: "2 NOS",
            motor: "1 HP SOLAR WATER PUMP and Motor",
            controller: "1 HP Solar Water Pump Controller"
        },

        "2 HP": {
            cost: "1,47,550",
            panelQty: "4 NOS",
            motor: "2 HP SOLAR WATER PUMP and Motor",
            controller: "2 HP Solar Water Pump Controller"
        },

        "3 HP": {
            cost: "1,82,000",
            panelQty: "6 NOS",
            motor: "3 HP SOLAR WATER PUMP and Motor",
            controller: "3 HP Solar Water Pump Controller"
        },

        "5 HP": {
            cost: "3,20,000",
            panelQty: "9 NOS",
            motor: "5 HP SOLAR WATER PUMP and Motor",
            controller: "5 HP Solar Water Pump Controller"
        },

        "7.5 HP": {
            cost: "4,15,000",
            panelQty: "13 NOS",
            motor: "7.5 HP SOLAR WATER PUMP and Motor",
            controller: "7.5 HP Solar Water Pump Controller"
        }
    };

    const pump = config[hp] || config["1 HP"];

    return `
    
<tr>
<td colspan="2">

<div style="padding:20px;">

    <div style="
        text-align:center;
        font-size:28px;
        font-weight:bold;
        margin-bottom:10px;
    ">
        ${hp} SOLAR WATER PUMP SYSTEM
    </div>

    <div style="
        text-align:center;
        font-size:18px;
        font-weight:bold;
        margin-bottom:25px;
    ">
        ( WITH INSTALLATION AND TRANSPORT )
    </div>

    <h2 style="
        font-size:24px;
        text-decoration:underline;
        margin-bottom:15px;
    ">
        PROJECT DETAILS
    </h2>

    <table>
        <tr>
            <td width="30%"><b>Officer In Charge</b></td>
            <td>${data.officerName || 'Mr. Kiran Jagtap'}</td>
        </tr>

        <tr>
            <td><b>Contact</b></td>
            <td>${data.officerContact || '9665389150 / 8956922167'}</td>
        </tr>
    </table>

    <br>

    <h2 style="
        font-size:24px;
        text-decoration:underline;
        margin-bottom:15px;
    ">
        FINANCIAL OFFER
    </h2>

    <table>

        <tr>
            <th>Sr No</th>
            <th>Description</th>
            <th>Project Cost</th>
        </tr>

        <tr>
            <td>1</td>
            <td>
                Supply of Solar Water Pump, Motor and Controller,
                Solar PV Module, GI Structure Ground Mounted etc.
            </td>
            <td rowspan="6">
                ₹ ${pump.cost}/-
            </td>
        </tr>

        <tr>
            <td>2</td>
            <td>
                Supply of Solar Pump Pipe, Solar Cable and Nylon Rope
            </td>
        </tr>

        <tr>
            <td>3</td>
            <td>
                Other Misc Material Applicable To Solar Water Pump System
            </td>
        </tr>

        <tr>
            <td>4</td>
            <td>
                Packing, Unpacking, Loading, Unloading,
                Installation & Warranty Services
            </td>
        </tr>

        <tr>
            <td>5</td>
            <td>
                Transportation Included
            </td>
        </tr>

        <tr>
            <td>6</td>
            <td>
                Taxes As Applicable
            </td>
        </tr>

    </table>

    <br>

    <h2 style="
        font-size:24px;
        text-decoration:underline;
        margin-bottom:15px;
    ">
        BILL OF MATERIAL
    </h2>

    <table>

        <tr>
            <th>Sr</th>
            <th>Item</th>
            <th>Specification</th>
            <th>Make</th>
            <th>Qty</th>
        </tr>

        <tr>
            <td>1</td>
            <td>Solar PV Modules</td>
            <td>535 To 550 Wp Mono Crystalline</td>
            <td>
                Vikram / Goldi / Renewsys /
                Mackwin / Livguard / Microtech
            </td>
            <td>${pump.panelQty}</td>
        </tr>

        <tr>
            <td>2</td>
            <td>Solar Water Pump Motor</td>
            <td>
                ${pump.motor}
                <br>
                <b>FULLY SS IMPELLER</b>
            </td>
            <td>SOLARICA<br>2 Years Warranty</td>
            <td>1 EACH</td>
        </tr>

        <tr>
            <td>3</td>
            <td>Solar Water Pump Controller</td>
            <td>
                ${pump.controller}
                <br>
                3 Phase / Single Phase
            </td>
            <td>SOLARICA<br>2 Years Warranty</td>
            <td>1 NOS</td>
        </tr>

        <tr>
            <td>4</td>
            <td>Solar Panel Mounting Structure</td>
            <td>GI Structure</td>
            <td>
                GI Structure Approved
                <br>
                5 Years Warranty
            </td>
            <td>1 SET</td>
        </tr>

        <tr>
            <td>5</td>
            <td>Solar Pump Pipe</td>
            <td>
                6 Gauge Solar Pipe With Adjuster
            </td>
            <td>Warranted</td>
            <td>APR</td>
        </tr>

        <tr>
            <td>6</td>
            <td>Nylon Rope</td>
            <td>Nylon Rope</td>
            <td>Warranted</td>
            <td>APR</td>
        </tr>

        <tr>
            <td>7</td>
            <td>Solar Pump Cable</td>
            <td>
                3 Core Cable For Connection To Controller
            </td>
            <td>Polycab</td>
            <td>APR</td>
        </tr>

        <tr>
            <td>8</td>
            <td>Installation Charges</td>
            <td>
                Installation Charges With Foundation Work
            </td>
            <td>SOLARICA</td>
            <td>-</td>
        </tr>

        <tr>
            <td>9</td>
            <td>Transportation Charges</td>
            <td>
                From Pune To Installation Location
            </td>
            <td>-</td>
            <td>-</td>
        </tr>

    </table>

    <br>

    <h2 style="
        font-size:24px;
        text-decoration:underline;
    ">
        TERMS & CONDITIONS
    </h2>

    <ul>

        <li>
            Proposal validity is 5 days.
        </li>

        <li>
            AMC available at Rs.3000/kWp/year.
        </li>

        <li>
            Material cost may vary if scope changes.
        </li>

        <li>
            Installation within 4 days after advance payment.
        </li>

    </ul>

    <h2 style="
        font-size:24px;
        text-decoration:underline;
    ">
        PAYMENT TERMS
    </h2>

    <ul>

        <li>
            95% Advance With Purchase Order.
        </li>

        <li>
            5% After Installation.
        </li>

    </ul>

    <h2 style="
        font-size:24px;
        text-decoration:underline;
    ">
        WARRANTY
    </h2>

    <ul>

        <li>
            PV Module Performance Warranty
            95% For 10 Years &
            85% For 15 Years.
        </li>

        <li>
            Back To Back Manufacturer Warranty.
        </li>

        <li>
            AMC Extra.
        </li>

    </ul>

</div>

</td>
</tr>
`;
};