export const get5HPPumpTemplate = () => {

return `
<div class="pump-page">

    <div class="text-center mt-10">
        <h2 class="text-3xl font-bold">
            5 HP SOLAR WATER PUMP SYSTEM
        </h2>

        <p>
            ( WITH INSTALLATION AND TRANSPORT )
        </p>
    </div>

    <div class="mt-8">

        <h3 class="font-bold text-xl underline">
            PROJECT DETAILS
        </h3>

        <table class="w-full border mt-3">
            <tr>
                <td class="border p-2 font-bold">
                    Officer In Charge
                </td>

                <td class="border p-2">
                    {{OFFICER_NAME}}
                </td>
            </tr>

            <tr>
                <td class="border p-2 font-bold">
                    Contact
                </td>

                <td class="border p-2">
                    {{CONTACT}}
                </td>
            </tr>
        </table>

    </div>

</div>
`;
};

export const build5HPPumpHTML = (data:any)=>{
   return `<h1>5 HP</h1>`;
}