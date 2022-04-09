// eslint-disable-next-line import/no-anonymous-default-export
export default {
    data: {
        type: "model",
        id: "58d3bcf97c6b1644db73ad12",
        attributes: {
            name: "Drink choice",
            description:
                "This is a demo model which has been built to define the best suited drink choice for a customer at a restaurant.\r\n\r\nExpert: Best chef in town\r\n\r\nDemo model created for testing the API",
            metadata: {
                prediction: {
                    domain: {
                        type: "DomainC",
                        values: [
                            "Red Cappuccino",
                            "Espresso",
                            "Cappuccino",
                            "Water / Fruit Juice",
                            "Fizzy Drink",
                            "Milkshake",
                        ],
                    },
                    name: "INPUTVAR0",
                    question: "Drink choice?",
                    type: "Nominal",
                },
                attributes: [
                    {
                        domain: {
                            discrete: true,
                            interval: 1.0,
                            lower: -10.0,
                            type: "DomainR",
                            upper: 45.0,
                        },
                        name: "INPUTVAR1",
                        question: "Temperature?",
                        type: "Continuous",
                    },
                    {
                        domain: { type: "DomainC", values: ["Male", "Female"] },
                        name: "INPUTVAR2",
                        question: "Gender?",
                        type: "Nominal",
                    },
                    {
                        domain: {
                            discrete: true,
                            interval: 1.0,
                            lower: 1.0,
                            type: "DomainR",
                            upper: 90.0,
                        },
                        name: "INPUTVAR3",
                        question: "Age?",
                        type: "Continuous",
                    },
                    {
                        domain: { type: "DomainC", values: ["Yes", "No", "Not sure"] },
                        name: "INPUTVAR4",
                        question: "Sensitive to Caffeine?",
                        type: "Nominal",
                    },
                    {
                        domain: {
                            type: "DomainC",
                            values: ["Morning", "Afternoon", "Evening"],
                        },
                        name: "INPUTVAR5",
                        question: "Time of day?",
                        type: "Nominal",
                    },
                    {
                        domain: { type: "DomainC", values: ["Yes", "No", "NA"] },
                        name: "INPUTVAR6",
                        question: "Pregnant?",
                        type: "Nominal",
                    },
                    {
                        domain: { type: "DomainC", values: ["Yes", "No"] },
                        name: "INPUTVAR7",
                        question: "Health conscious?",
                        type: "Nominal",
                    },
                    {
                        domain: {
                            discrete: true,
                            interval: 1.0,
                            lower: 0.0,
                            type: "DomainR",
                            upper: 20.0,
                        },
                        name: "INPUTVAR8",
                        question: "Number of drink consumed per day?",
                        type: "Continuous",
                    },
                    {
                        domain: {
                            discrete: true,
                            interval: 1.0,
                            lower: 0.0,
                            type: "DomainR",
                            upper: 20.0,
                        },
                        name: "INPUTVAR9",
                        question: "Number of drinks consumed today?",
                        type: "Continuous",
                    },
                ],
            },
            exclusions: {
                rules: [
                    {
                        antecedent: { index: 5, threshold: "Yes", type: "EQ" },
                        consequent: { type: "ClassRes", value: "Water / Fruit Juice" },
                        type: "BlatantEx",
                    },
                    {
                        antecedent: [{ index: 1, threshold: "Male", type: "EQ" }],
                        consequent: [{ index: 5, threshold: "NA", type: "EQ" }],
                        type: "ValueEx",
                    },
                    {
                        antecedent: [{ index: 1, threshold: "Male", type: "NEQ" }],
                        consequent: [{ index: 5, threshold: "NA", type: "NEQ" }],
                        type: "ValueEx",
                    },
                    {
                        antecedent: [{ index: 5, threshold: "NA", type: "NEQ" }],
                        consequent: [{ index: 1, threshold: "Male", type: "NEQ" }],
                        type: "ValueEx",
                    },
                    {
                        type: "RelationshipEx",
                        relation: { index: 8, threshold: 7, type: "LTEQ" },
                    },
                    {
                        antecedent: { index: 7, threshold: 1.0, type: "LTEQ" },
                        consequent: { type: "ClassRes", value: "Water / Fruit Juice" },
                        type: "BlatantEx",
                    },
                    {
                        antecedent: { index: 8, threshold: 1.0, type: "LTEQ" },
                        consequent: { type: "ClassRes", value: "Water / Fruit Juice" },
                        type: "BlatantEx",
                    },
                ],
            },
            publisher: "APIDemo",
            "publish-date": "2022-03-08T10:25:20Z",
            measurements: {
                levers: [
                    { drop: 1.0, index: 0 },
                    { drop: 0.47154471544715454, index: 3 },
                    { drop: 0.4471544715447154, index: 8 },
                    { drop: 0.4471544715447153, index: 4 },
                    { drop: 0.2764227642276423, index: 7 },
                    { drop: 0.11382113821138212, index: 2 },
                    { drop: 0.02439024390243903, index: 6 },
                    { drop: 0.0, index: 1 },
                    { drop: 0.0, index: 5 },
                ],
                oob_error: 0.7410770548513131,
            },
        },
    },
};
