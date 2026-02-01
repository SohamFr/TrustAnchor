import PasswordStrength from '@/components/PasswordStrength';

export default function PasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
            <PasswordStrength />
        </div>
    );
}
