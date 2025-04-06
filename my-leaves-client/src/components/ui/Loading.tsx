export const Loading = ({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) => (
    <div className="flex justify-center items-center p-4"> {/* Reduced padding */}
      {/* Use span with loading classes per daisyUI docs */}
      <span className={`loading loading-spinner loading-${size}`}></span>
      <span className="sr-only">Loading...</span> {/* For screen readers */}
    </div>
  );;