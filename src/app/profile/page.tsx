'use client';

import { useState, useRef } from 'react';
import { useUserProgress } from '@/context/UserProgressContext';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Shield, Zap, Terminal, GraduationCap, User, Settings as SettingsIcon, Sun, Moon, Volume2, VolumeX, LogOut, Cpu, Edit2, Camera, X, Check } from 'lucide-react';
import { useSecurity } from '@/context/SecurityContext';

export default function ProfilePage() {
    const { user } = useUser();
    const { progress, badges, toggleTheme, getSecurityClearance } = useUserProgress();
    const { isMuted, toggleMuted } = useSecurity();
    const [activeTab, setActiveTab] = useState('profile');
    const fileInputRef = useRef(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const xpForNextLevel = (progress.level) * 500;
    const xpProgress = (progress.xp % 500) / 500 * 100;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'stats', label: 'Stats', icon: TrendingUp },
        { id: 'achievements', label: 'Achievements', icon: Award },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    const handleAvatarUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploadingAvatar(true);
        try {
            await user.setProfileImage({ file });
        } catch (error) {
            console.error('Avatar upload failed:', error);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    return (
        <div className="min-h-full p-6 max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar with Upload */}
                    <div className="relative group">
                        <img
                            src={user?.imageUrl || '/default-avatar.png'}
                            alt="Avatar"
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-cyan-500 shadow-lg"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            disabled={isUploadingAvatar}
                        >
                            {isUploadingAvatar ? (
                                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Camera size={32} className="text-cyan-400" />
                            )}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />

                        <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-white text-sm md:text-base font-bold px-3 py-1.5 rounded-full border-4 border-slate-950">
                            LVL {progress.level}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-cyan-100 mb-2">
                            {user?.fullName || user?.username || 'Operator'}
                        </h1>
                        <p className="text-slate-400 text-base mb-4">{user?.primaryEmailAddress?.emailAddress}</p>

                        <div className="flex items-center gap-3 bg-cyan-950/40 border border-cyan-700/30 px-4 py-2 rounded-lg w-fit">
                            <Shield size={20} className="text-cyan-400" />
                            <span className="text-cyan-300 font-mono text-base font-bold">
                                {getSecurityClearance()}
                            </span>
                        </div>
                    </div>

                    {/* XP Display */}
                    <div className="w-full md:w-64">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 text-sm font-mono">Experience</span>
                            <span className="text-cyan-400 text-sm font-mono font-bold">
                                {progress.xp} / {xpForNextLevel} XP
                            </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-cyan-900/30">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-900/30 rounded-2xl overflow-hidden">
                <div className="flex border-b border-cyan-900/30 bg-slate-900/50">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-mono transition-colors relative ${activeTab === tab.id
                                        ? 'text-cyan-400 bg-slate-950/50'
                                        : 'text-slate-500 hover:text-cyan-300 hover:bg-slate-900/30'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="hidden md:inline">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 md:p-8">
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'stats' && <StatsTab progress={progress} />}
                    {activeTab === 'achievements' && <AchievementsTab badges={badges} />}
                    {activeTab === 'settings' && <SettingsTab toggleTheme={toggleTheme} theme={progress.theme} isMuted={isMuted} toggleMuted={toggleMuted} />}
                </div>
            </div>
        </div>
    );
}

function ProfileTab() {
    const { user } = useUser();
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleUsernameEdit = () => {
        setNewUsername(user?.username || '');
        setIsEditingUsername(true);
    };

    const handleUsernameSave = async () => {
        if (!newUsername.trim() || !user) return;

        setIsSaving(true);
        try {
            await user.update({ username: newUsername });
            setIsEditingUsername(false);
        } catch (error) {
            console.error('Username update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-100 mb-6">Profile Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Editable Username Card */}
                <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-5 relative">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-500 font-mono uppercase">USERNAME</div>
                        {!isEditingUsername && (
                            <button
                                onClick={handleUsernameEdit}
                                className="p-1.5 hover:bg-cyan-900/30 rounded transition-colors"
                            >
                                <Edit2 size={16} className="text-cyan-400" />
                            </button>
                        )}
                    </div>

                    {isEditingUsername ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="flex-1 bg-slate-950/50 border border-cyan-900/50 rounded px-3 py-2 text-cyan-100 outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Enter username"
                                disabled={isSaving}
                            />
                            <button
                                onClick={handleUsernameSave}
                                disabled={isSaving || !newUsername.trim()}
                                className="p-2 bg-cyan-950/50 border border-cyan-900/50 rounded hover:bg-cyan-900/50 transition-colors disabled:opacity-50"
                            >
                                <Check size={18} className="text-cyan-400" />
                            </button>
                            <button
                                onClick={() => setIsEditingUsername(false)}
                                disabled={isSaving}
                                className="p-2 bg-slate-950/50 border border-slate-700 rounded hover:bg-slate-800/50 transition-colors"
                            >
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-lg text-cyan-100 font-semibold">
                            {user?.username || 'Not set'}
                        </div>
                    )}
                </div>

                <InfoCard label="Email" value={user?.primaryEmailAddress?.emailAddress || 'Not set'} />
                <InfoCard label="First Name" value={user?.firstName || 'Not set'} />
                <InfoCard label="Last Name" value={user?.lastName || 'Not set'} />
            </div>
        </div>
    );
}

function StatsTab({ progress }) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-100 mb-6">Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Zap size={24} />} label="Total Scans" value={progress.totalScans} color="text-cyan-400" />
                <StatCard icon={<Shield size={24} />} label="Threats Found" value={progress.threatsDetected} color="text-red-400" />
                <StatCard icon={<GraduationCap size={24} />} label="Lessons Done" value={progress.academyLessonsCompleted} color="text-emerald-400" />
                <StatCard icon={<Terminal size={24} />} label="Commands Run" value={progress.terminalCommandsRun} color="text-purple-400" />
            </div>
        </div>
    );
}

function AchievementsTab({ badges }) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-100 mb-6">Achievements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                ))}
            </div>
        </div>
    );
}

function SettingsTab({ toggleTheme, theme, isMuted, toggleMuted }) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-100 mb-6">Settings</h2>

            <div className="space-y-4">
                {/* Theme */}
                <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? <Moon size={24} className="text-cyan-400" /> : <Sun size={24} className="text-yellow-400" />}
                            <div>
                                <h3 className="text-lg font-bold text-cyan-100">Theme</h3>
                                <p className="text-sm text-slate-400">Switch between dark and light mode</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="px-6 py-3 bg-cyan-950/50 border border-cyan-900/50 rounded-lg text-cyan-400 hover:bg-cyan-900/50 transition-colors font-mono text-sm uppercase"
                        >
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </div>

                {/* Audio */}
                <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isMuted ? <VolumeX size={24} className="text-slate-400" /> : <Volume2 size={24} className="text-cyan-400" />}
                            <div>
                                <h3 className="text-lg font-bold text-cyan-100">Sound Effects</h3>
                                <p className="text-sm text-slate-400">Toggle UI sound effects</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleMuted}
                            className="px-6 py-3 bg-cyan-950/50 border border-cyan-900/50 rounded-lg text-cyan-400 hover:bg-cyan-900/50 transition-colors font-mono text-sm uppercase"
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Cpu size={24} className="text-cyan-400" />
                        <h3 className="text-lg font-bold text-cyan-100">System Status</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded border border-white/5">
                            <span className="text-slate-400">Connection</span>
                            <span className="text-emerald-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                ONLINE
                            </span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded border border-white/5">
                            <span className="text-slate-400">API Latency</span>
                            <span className="text-slate-400">~45ms</span>
                        </div>
                    </div>
                </div>

                {/* Sign Out */}
                <div className="pt-4">
                    <SignOutButton>
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-950/30 border border-red-900/50 text-red-400 hover:bg-red-900/50 transition-colors rounded-xl font-mono text-sm uppercase tracking-wider">
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-5">
            <div className="text-sm text-slate-500 font-mono uppercase mb-2">{label}</div>
            <div className="text-lg text-cyan-100 font-semibold">{value}</div>
        </div>
    );
}

function StatCard({ icon, label, value, color = 'text-cyan-400' }) {
    return (
        <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-6">
            <div className={`mb-3 ${color}`}>{icon}</div>
            <div className="text-3xl font-bold text-cyan-100 mb-2">{value}</div>
            <div className="text-sm text-slate-500 font-mono uppercase">{label}</div>
        </div>
    );
}

function BadgeCard({ badge }) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`bg-slate-900/50 border rounded-xl p-6 text-center transition-all ${badge.unlocked
                    ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'border-slate-800 opacity-40 grayscale'
                }`}
        >
            <div className="text-5xl mb-3">{badge.icon}</div>
            <div className={`text-base font-bold mb-2 ${badge.unlocked ? 'text-cyan-100' : 'text-slate-600'}`}>
                {badge.name}
            </div>
            <div className={`text-sm ${badge.unlocked ? 'text-slate-400' : 'text-slate-700'}`}>
                {badge.description}
            </div>
            {badge.unlocked && (
                <div className="mt-3 text-xs text-cyan-400 font-mono uppercase bg-cyan-950/30 px-3 py-1 rounded-full inline-block">
                    Unlocked
                </div>
            )}
        </motion.div>
    );
}
