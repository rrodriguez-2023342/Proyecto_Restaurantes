
export const DeliveryTruck = () => {
    return (
        <div className="flex items-center justify-center w-full py-4">
            <style>{`
                .truck-wrapper {
                    width: 220px;
                    height: 110px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    align-items: center;
                    justify-content: flex-end;
                    overflow-x: hidden;
                }
                .truck-body {
                    width: 140px;
                    height: fit-content;
                    margin-bottom: 6px;
                    animation: truckMotion 1s linear infinite;
                }
                @keyframes truckMotion {
                    0%   { transform: translateY(0px); }
                    50%  { transform: translateY(3px); }
                    100% { transform: translateY(0px); }
                }
                .truck-tires {
                    width: 140px;
                    height: fit-content;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0px 10px 0px 18px;
                    position: absolute;
                    bottom: 0;
                }
                .truck-tires svg {
                    width: 26px;
                }
                .truck-road {
                    width: 100%;
                    height: 2px;
                    background-color: #e2e8f0;
                    position: relative;
                    bottom: 0;
                    align-self: flex-end;
                    border-radius: 3px;
                }
                .truck-road::before {
                    content: "";
                    position: absolute;
                    width: 20px;
                    height: 100%;
                    background-color: #cbd5e1;
                    right: -50%;
                    border-radius: 3px;
                    animation: truckRoadAnim 1.4s linear infinite;
                    border-left: 10px solid white;
                }
                .truck-road::after {
                    content: "";
                    position: absolute;
                    width: 10px;
                    height: 100%;
                    background-color: #cbd5e1;
                    right: -65%;
                    border-radius: 3px;
                    animation: truckRoadAnim 1.4s linear infinite;
                    border-left: 4px solid white;
                }
                .truck-lamp {
                    position: absolute;
                    bottom: 0;
                    right: -90%;
                    height: 90px;
                    animation: truckRoadAnim 1.4s linear infinite;
                    opacity: 0.2;
                }
                @keyframes truckRoadAnim {
                    0%   { transform: translateX(0px); }
                    100% { transform: translateX(-350px); }
                }
            `}</style>
            <div className="truck-wrapper">
                {/* Truck Body */}
                <div className="truck-body">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93">
                        <path strokeWidth="3" stroke="#1e293b" fill="#f97316" d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z" />
                        <path strokeWidth="3" stroke="#1e293b" fill="#94a3b8" d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z" />
                        <path strokeWidth="2" stroke="#1e293b" fill="#1e293b" d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z" />
                        <rect strokeWidth="2" stroke="#1e293b" fill="#fef9c3" rx="1" height="7" width="5" y="63" x="187" />
                        <rect strokeWidth="2" stroke="#1e293b" fill="#1e293b" rx="1" height="11" width="4" y="81" x="193" />
                        <rect strokeWidth="3" stroke="#1e293b" fill="#f1f5f9" rx="2.5" height="90" width="121" y="1.5" x="6.5" />
                        <rect strokeWidth="2" stroke="#1e293b" fill="#f1f5f9" rx="2" height="4" width="6" y="84" x="1" />
                    </svg>
                </div>
                {/* Tires */}
                <div className="truck-tires">
                    {[0, 1].map(i => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30">
                            <circle strokeWidth="3" stroke="#1e293b" fill="#1e293b" r="13.5" cy="15" cx="15" />
                            <circle fill="#f1f5f9" r="7" cy="15" cx="15" />
                        </svg>
                    ))}
                </div>
                {/* Road */}
                <div className="truck-road" />
                {/* Lamp Post */}
                <svg viewBox="0 0 453.459 453.459" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="truck-lamp">
                    <path d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z" />
                </svg>
            </div>
        </div>
    );
};
