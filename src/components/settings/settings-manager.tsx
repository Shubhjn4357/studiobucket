"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const Settings = Icons.settings
const Save = Icons.save
const RefreshCw = Icons.refreshCw
const Bell = Icons.bell

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      appName: "StudioBucket",
      timezone: "UTC",
      language: "English",
      theme: "dark",
    },
    account: {
      email: "user@example.com",
      name: "John Doe",
      avatar: "",
      notifications: true,
    },
    youtube: {
      connected: true,
      channelName: "My Channel",
      channelId: "UC1234567890",
      defaultPrivacy: "public",
      defaultCategory: "Technology",
    },
    notifications: {
      email: true,
      push: true,
      uploadComplete: true,
      uploadFailed: true,
      queueEmpty: false,
      weeklyReport: true,
    },
    api: {
      enabled: true,
      key: "sk_test_1234567890",
      webhookUrl: "",
      rateLimit: 1000,
    },
    advanced: {
      logLevel: "info",
      maxConcurrentUploads: 3,
      retryAttempts: 3,
      cleanupDays: 30,
    },
  })

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "account", label: "Account", icon: Icons.user },
    { id: "youtube", label: "YouTube", icon: Icons.youtube },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API", icon: Icons.shield },
    { id: "advanced", label: "Advanced", icon: Icons.database },
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Application Name</label>
        <input
          type="text"
          value={settings.general.appName}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            general: { ...prev.general, appName: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Timezone</label>
        <select
          value={settings.general.timezone}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            general: { ...prev.general, timezone: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        >
          <option value="UTC">UTC</option>
          <option value="EST">EST</option>
          <option value="PST">PST</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Language</label>
        <select
          value={settings.general.language}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            general: { ...prev.general, language: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Theme</label>
        <select
          value={settings.general.theme}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            general: { ...prev.general, theme: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    </div>
  )

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          value={settings.account.email}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            account: { ...prev.account, email: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={settings.account.name}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            account: { ...prev.account, name: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Avatar</label>
        <input
          type="file"
          accept="image/*"
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.account.notifications}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            account: { ...prev.account, notifications: e.target.checked }
          }))}
        />
        <label className="text-sm font-medium">Enable notifications</label>
      </div>
    </div>
  )

  const renderYouTubeSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">YouTube Connection</h4>
          <p className="text-sm text-muted-foreground">
            {settings.youtube.connected ? "Connected" : "Not connected"}
          </p>
        </div>
        <Button variant={settings.youtube.connected ? "destructive" : "default"}>
          {settings.youtube.connected ? "Disconnect" : "Connect"}
        </Button>
      </div>

      {settings.youtube.connected && (
        <>
          <div>
            <label className="text-sm font-medium">Channel Name</label>
            <input
              type="text"
              value={settings.youtube.channelName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                youtube: { ...prev.youtube, channelName: e.target.value }
              }))}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default Privacy</label>
            <select
              value={settings.youtube.defaultPrivacy}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                youtube: { ...prev.youtube, defaultPrivacy: e.target.value }
              }))}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Default Category</label>
            <select
              value={settings.youtube.defaultCategory}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                youtube: { ...prev.youtube, defaultCategory: e.target.value }
              }))}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="Technology">Technology</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
        </>
      )}
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              notifications: { ...prev.notifications, [key]: e.target.checked }
            }))}
          />
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
        </div>
      ))}
    </div>
  )

  const renderAPISettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.api.enabled}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            api: { ...prev.api, enabled: e.target.checked }
          }))}
        />
        <label className="text-sm font-medium">Enable API</label>
      </div>
      <div>
        <label className="text-sm font-medium">API Key</label>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={settings.api.key}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              api: { ...prev.api, key: e.target.value }
            }))}
            className="flex-1 mt-1 px-3 py-2 border rounded-md"
          />
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Webhook URL</label>
        <input
          type="url"
          value={settings.api.webhookUrl}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            api: { ...prev.api, webhookUrl: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Rate Limit (requests/hour)</label>
        <input
          type="number"
          value={settings.api.rateLimit}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            api: { ...prev.api, rateLimit: parseInt(e.target.value) }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
    </div>
  )

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Log Level</label>
        <select
          value={settings.advanced.logLevel}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            advanced: { ...prev.advanced, logLevel: e.target.value }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        >
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Max Concurrent Uploads</label>
        <input
          type="number"
          value={settings.advanced.maxConcurrentUploads}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            advanced: { ...prev.advanced, maxConcurrentUploads: parseInt(e.target.value) }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Retry Attempts</label>
        <input
          type="number"
          value={settings.advanced.retryAttempts}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            advanced: { ...prev.advanced, retryAttempts: parseInt(e.target.value) }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Cleanup Days</label>
        <input
          type="number"
          value={settings.advanced.cleanupDays}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            advanced: { ...prev.advanced, cleanupDays: parseInt(e.target.value) }
          }))}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings()
      case "account":
        return renderAccountSettings()
      case "youtube":
        return renderYouTubeSettings()
      case "notifications":
        return renderNotificationSettings()
      case "api":
        return renderAPISettings()
      case "advanced":
        return renderAdvancedSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="capitalize">
              {tabs.find(tab => tab.id === activeTab)?.label} Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
