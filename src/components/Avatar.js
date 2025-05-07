// Create a new component called Avatar.js
const Avatar = ({ name, size = 40 }) => {
    // Get initials from name
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    // Generate a consistent background color based on the name
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div 
        className="flex items-center justify-center rounded-full text-white font-medium"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          backgroundColor: colors[colorIndex],
          fontSize: `${size / 2.5}px`
        }}
      >
        {initials}
      </div>
    );
  };
  
  export default Avatar;