
export const transitData = {
    lines: [
        {
            id: '1',
            name: 'Division Blue Line',
            color: '#3b82f6', // Blue color
            destinations: [
                {
                    direction: 'North to O\'Hare',
                    arrivals: [
                        { id: '1', minutes: 9 },
                        { id: '2', minutes: 14 },
                        { id: '3', minutes: 19 }
                    ]
                }
            ]
        },
        // You can add more transit lines here as needed
        {
            id: '2',
            name: 'California Pink Line',
            color: '#ec4899', // Pink color
            destinations: [
                {
                    direction: 'East to Loop',
                    arrivals: [
                        { id: '1', minutes: 4 },
                        { id: '2', minutes: 11 },
                        { id: '3', minutes: 18 }
                    ]
                }
            ]
        }
    ],
};

//below is used for dropdown
export const busDropdownMock = [
    { label: '1 - Bronzville/Union Station', value: '1' },
    { label: '2 - Hyde Park Express', value: '2' },
    { label: '3 - King Drive', value: '3' },
    { label: 'X4 - Cottage Grove Express', value: '4' },
    { label: 'N5 - South Shore Night Bus - OWL', value: '5' },
];

export const stopDropdownMock=[
    {label: 'Clark and Lake', value: 1},
    {label: 'Ashland and Division', value: 2},
    {label: 'Milwaukee and Kinzie', value: 3},
    {label: 'Peterson and California', value: 4},
    {label: 'Halsted and Addison', value: 5},
]

export const favoriteMock={
    id: '1e2d46',
    title: 'duude',
    stops: 1,
}