import Image from "next/image";
import deleteImg from '../../../public/assets/images/icon-delete.svg';
import ArrowRight from '../../../public/assets/images/icon-arrow-right.svg';

// interface LogItem {
//     id: string;
//     from: string;
//     to: string;
//     sendAmount: string;
//     receiveAmount: string;
//     rate: string;
//     timestamp: string;
// }

export interface LogItem {
    id: string;
    from: string;
    to: string;
    sendAmount: string;
    receiveAmount: string;
    rate: string;
    timestamp: string;
}

export interface LogsProps {
    logs?: LogItem[];
    clearLogs?: () => void;
    removeLog?: (id: string) => void;
}

function Logs({ logs = [], clearLogs = () => {}, removeLog = () => {} }: LogsProps) {
    return (
        <div className='mb-50 border bg-[#171719] p-5 rounded-2xl border-[#131314] text-white'>
            <span className='flex flex-col gap-2 md:flex-row md:justify-between md:items-center'>
                <h1 className='text-2xl font-semibold'>CONVERSION LOG</h1>
                <span className="text-[#626263] text-lg font-semibold flex justify-between items-center md:gap-8">
                    <p>{logs.length} ENTRIES</p>
                    {logs.length > 0 && (
                        <button 
                            onClick={clearLogs}
                            className="border py-1 px-2 rounded-lg cursor-pointer hover:bg-[#28282b] text-white text-sm transition-colors"
                        >
                            CLEAR ALL
                        </button>
                    )}
                </span>
            </span>
 
            {/* Cards Box Container */}
            <div className='mt-5 flex flex-col gap-4'>
                {logs.length === 0 ? (
                    <div className='p-8 text-center text-[#626263] rounded-2xl'>
                        <h1 className="text-2xl text-white mb-15"> No conversion logs yet. </h1>
                        <p>Every conversation is recorded here auomatically when you tap LOG CONVERSION.</p>
                        <p>Your log is private to this session and this browser</p>
                    </div>
                ) : (
                    logs.map((item) => (
                        <div 
                            key={item.id} 
                            className='flex p-4 border-2 justify-between items-center bg-[#202022] border-[#28282b] rounded-2xl text-xl'
                        >
                            <div className='flex flex-col md:flex-row md:gap-10 md:items-center'>
                                <h3 className="text-left text-[#626263] text-base font-mono">
                                    {item.timestamp}
                                </h3>
                                <span className='flex flex-row gap-3 items-center font-bold font-mono'>
                                    <span>{item.from}</span>
                                    <span>
                                        <Image src={ArrowRight} alt="arrow" />
                                    </span>
                                    <span>{item.to}</span>
                                </span>
                            </div>
                            
                            <div className='flex gap-5 items-center'>
                                <span className='flex flex-col md:flex-row md:gap-5 font-mono'>
                                    <h3 className='text-lg'>{item.sendAmount}</h3>
                                    <h3 className="text-[#CEF739] text-right text-lg ">{item.receiveAmount}</h3>
                                </span>
                                <button 
                                    type="button"
                                    onClick={() => removeLog(item.id)}
                                    className='border rounded-md flex items-center p-3 border-[#36363a] cursor-pointer hover:bg-red-500/10 transition-colors'
                                >
                                    <Image src={deleteImg} alt="delete" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Logs;