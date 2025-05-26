import { auth } from '@/auth';
import DevButton from '@/components/dev-components/dev-button';
import { redirect } from 'next/navigation';
import React from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';

const page = async () => {
  const session = await auth();
  if (session) redirect("/app");
  return (
    <section className='md:bg-[url("https://scontent-hbe1-1.xx.fbcdn.net/v/t39.30808-6/471411222_122127522944572546_6475440340774723854_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=uD0AKxvz7moQ7kNvgFw3KPB&_nc_oc=Adh2T5RNUgRobqrga1C7HWPwr9gJGUuG7VZqavoZiwcI-K9yW_3lIGJPjflH-paxnl4&_nc_zt=23&_nc_ht=scontent-hbe1-1.xx&_nc_gid=AVDyT_riiZNRxG_z4WWpXQY&oh=00_AYAuCtgNphR4Nw9sST-1BLKFSb9DfOuwmtLh1WTltZd5Fg&oe=679AEECF")] bg-[url("https://scontent-hbe1-1.xx.fbcdn.net/v/t39.30808-6/471411222_122127522944572546_6475440340774723854_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=uD0AKxvz7moQ7kNvgFw3KPB&_nc_oc=Adh2T5RNUgRobqrga1C7HWPwr9gJGUuG7VZqavoZiwcI-K9yW_3lIGJPjflH-paxnl4&_nc_zt=23&_nc_ht=scontent-hbe1-1.xx&_nc_gid=AVDyT_riiZNRxG_z4WWpXQY&oh=00_AYAuCtgNphR4Nw9sST-1BLKFSb9DfOuwmtLh1WTltZd5Fg&oe=679AEECF")] bg-cover bg-no-repeat bg-center h-full w-full'>
      <DevButton
        href='/app'
        size='lg'
        rounded='full'
        className="px-10 !text-white group text-xl !bg-accentBlue/70 fixed gap-3 -translate-x-1/2 left-1/2 bottom-10"
      >
        Try Now<FaArrowRightLong className='group-hover:translate-x-3 transition-all' />
      </DevButton>
    </section>
  );
};

export default page;
