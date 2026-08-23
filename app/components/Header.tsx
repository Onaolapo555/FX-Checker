'use client';
import Image from 'next/image';
import logoImg from '@/public/assets/images/logo.svg'
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import { fetchLiveMarkets } from '@/services/currency';


function Header() {

  const { data: pairs = [], isLoading, isError } = useQuery({
    queryKey: ['liveMarkets'],
    queryFn: fetchLiveMarkets,
  })

  const scrollingPairs= [...pairs, ...pairs]

  return (
    <div>
      <div className="m-auto flex items-center gap-6 justify-between w-[90%] mt-4">
        <div>
          <Image 
          src={logoImg}
           alt="app-logo"
            />
        </div>
        <div className="text-[#898989] text-xs md:text-xl">55 CURRENCIES • EOD • ECB DATA</div>
      </div>
      <div className="mt-6 header">
        <h1 className="">
          • LIVE MARKETS
        </h1>


        <div className="ticker">
          <div className="ticker-content">
            {isLoading ? (
              <div className="text-xs text-gray-400 p-2">Loading live markets...</div>
            ) : isError ? (
              <div className="text-xs text-red-400 p-2">Unable to load ticker data</div>
            ) : (
              scrollingPairs.map((pair, i) => {
                const isUp = pair.change.startsWith('+');

                return (
                  <div key={`${pair.symbol}-${i}`} className="ticker-item">
                    <span className="symbol">{pair.symbol}</span>
                    <span className="rate">{pair.rate}</span>
                    <span className={isUp ? 'up' : 'down'}>
                      {isUp ? <FaChevronUp /> : <FaChevronDown />}
                      {pair.change}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;

