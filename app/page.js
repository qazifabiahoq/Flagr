'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Bell,
  Activity,
  ChevronRight,
  X,
  Loader2,
  AlertOctagon,
  Clock,
  MapPin,
  DollarSign,
  User,
  Monitor,
  FileText,
  Settings,
  LogOut,
  TrendingUp,
  Zap,
  RefreshCw,
  Send,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { mockTransactions, formatCurrency, formatTime, getRiskLevel, getRiskColor } from '@/lib/mockData';

// Risk colors
const COLORS = {
  critical: '#E63946',
  high: '#E63946',
  medium: '#F4A261',
  low: '#2DC653',
  navy: '#0A0F1E',
};

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    flagged: { color: 'bg-risk-critical/20 text-risk-critical border-risk-critical/30', icon: AlertTriangle },
    blocked: { color: 'bg-red-900/30 text-red-400 border-red-500/30', icon: XCircle },
    review: { color: 'bg-risk-medium/20 text-risk-medium border-risk-medium/30', icon: Eye },
    clear: { color: 'bg-risk-low/20 text-risk-low border-risk-low/30', icon: CheckCircle },
  };
  const config = statusConfig[status] || statusConfig.clear;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} font-medium`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Risk score bar component
function RiskScoreBar({ score }) {
  const color = getRiskColor(score);
  const isCritical = score >= 90;
  return (
    <div className="flex items-center gap-2 w-32">
      <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${isCritical ? 'animate-pulse-red' : ''}`}
          style={{ backgroundColor: color }}
        />
      </div>
      <span className={`text-sm font-bold w-8 ${isCritical ? 'animate-pulse-red' : ''}`} style={{ color }}>
        {score}
      </span>
    </div>
  );
}

// Risk level chip component
function RiskLevelChip({ score }) {
  const level = getRiskLevel(score);
  const colorClass = {
    CRITICAL: 'bg-risk-critical text-white animate-pulse-red',
    HIGH: 'bg-risk-high/20 text-risk-high border border-risk-high/30',
    MEDIUM: 'bg-risk-medium/20 text-risk-medium border border-risk-medium/30',
    LOW: 'bg-risk-low/20 text-risk-low border border-risk-low/30',
  }[level];
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
      {level}
    </span>
  );
}

// Circular gauge component
function CircularGauge({ score, size = 120 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getRiskColor(score);
  const isCritical = score >= 90;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1a2744"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
          className={isCritical ? 'animate-pulse-red' : ''}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${isCritical ? 'animate-pulse-red' : ''}`} style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-gray-400">Risk Score</span>
      </div>
    </div>
  );
}

// Agent step indicator
function AgentStepIndicator({ steps, isLoading, currentStep }) {
  const agents = [
    { name: 'Anomaly Detector', icon: Search, loadingText: 'Scanning transaction patterns...' },
    { name: 'Reasoning Agent', icon: Activity, loadingText: 'Analyzing risk factors...' },
    { name: 'Report Generator', icon: FileText, loadingText: 'Compiling compliance report...' },
    { name: 'Action Recommender', icon: CheckSquare, loadingText: 'Determining actions...' },
  ];

  return (
    <div className="space-y-3">
      {agents.map((agent, idx) => {
        const step = steps?.[idx];
        const isActive = isLoading && currentStep === idx;
        const isComplete = step?.status === 'complete' || (!isLoading && steps?.length > 0);
        const isPending = isLoading && currentStep < idx;

        return (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              isActive ? 'border-risk-medium bg-risk-medium/10' :
              isComplete ? 'border-risk-low/30 bg-risk-low/5' :
              'border-border bg-secondary/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              isActive ? 'bg-risk-medium/20' :
              isComplete ? 'bg-risk-low/20' :
              'bg-secondary'
            }`}>
              {isActive ? (
                <Loader2 className="w-5 h-5 text-risk-medium animate-spin" />
              ) : isComplete ? (
                <CheckCircle className="w-5 h-5 text-risk-low" />
              ) : (
                <agent.icon className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium text-sm ${
                isActive ? 'text-risk-medium' :
                isComplete ? 'text-white' :
                'text-gray-400'
              }`}>
                {agent.name}
              </p>
              <p className="text-xs text-gray-500">
                {isActive ? agent.loadingText : step?.result || 'Pending'}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Case detail drawer component
function CaseDetailDrawer({ transaction, isOpen, onClose, onAnalyze }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    setAnalysis(null);

    // Simulate agent steps
    for (let i = 0; i < 4; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction })
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-navy-800 border-l border-border z-50 shadow-2xl"
          >
            <ScrollArea className="h-full">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{transaction?.transaction_id}</h2>
                    <p className="text-gray-400 text-sm">Case Investigation</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Transaction Details */}
                <Card className="bg-navy-700 border-border mb-6">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-lg">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Account</p>
                          <p className="font-medium">{transaction?.account_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-lg">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Amount</p>
                          <p className="font-medium">{formatCurrency(transaction?.amount || 0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Location</p>
                          <p className="font-medium">{transaction?.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-lg">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Time</p>
                          <p className="font-medium">{formatTime(transaction?.time_seconds || 0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-secondary rounded-lg">
                          <Monitor className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Merchant / Device IP</p>
                          <p className="font-medium">{transaction?.merchant} • {transaction?.device_ip}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Score Gauge */}
                {(analysis || transaction?.risk_score) && (
                  <div className="flex justify-center mb-6">
                    <CircularGauge score={analysis?.risk_score || transaction?.risk_score || 0} size={160} />
                  </div>
                )}

                {/* Analysis Button */}
                <Button
                  className="w-full mb-6 bg-risk-critical hover:bg-risk-critical/90"
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Zap className="w-4 h-4 mr-2" /> Run Full Flagr Analysis</>
                  )}
                </Button>

                {/* Agent Steps */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">ANALYSIS PIPELINE</h3>
                  <AgentStepIndicator
                    steps={analysis?.agent_steps || []}
                    isLoading={isAnalyzing}
                    currentStep={currentStep}
                  />
                </div>

                {/* Analysis Results */}
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Triggered Signals */}
                    {analysis.triggered_signals?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">TRIGGERED SIGNALS</h3>
                        <div className="space-y-2">
                          {analysis.triggered_signals.map((signal, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${
                              signal.severity === 'high' ? 'border-risk-critical/30 bg-risk-critical/10' :
                              'border-risk-medium/30 bg-risk-medium/10'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className={`w-4 h-4 ${
                                  signal.severity === 'high' ? 'text-risk-critical' : 'text-risk-medium'
                                }`} />
                                <span className="font-medium text-sm">{signal.signal}</span>
                              </div>
                              <p className="text-xs text-gray-400 ml-6">{signal.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reasoning */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">REASONING</h3>
                      <Card className="bg-navy-700 border-border">
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-300 leading-relaxed">{analysis.reasoning}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Compliance Report */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">COMPLIANCE REPORT</h3>
                      <Card className="bg-navy-700 border-border">
                        <CardContent className="p-4">
                          <p className="text-sm font-medium mb-2">{analysis.compliance_report?.finding}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {analysis.compliance_report?.regulation_refs?.map((ref, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{ref}</Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">{analysis.compliance_report?.recommendation}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">RECOMMENDED ACTIONS</h3>
                      <div className="space-y-2">
                        {analysis.recommended_actions?.map((action, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-navy-700 rounded-lg">
                            <CheckSquare className={`w-4 h-4 ${
                              action.priority === 'immediate' ? 'text-risk-critical' :
                              action.priority === 'high' ? 'text-risk-medium' :
                              'text-gray-400'
                            }`} />
                            <span className="text-sm flex-1">{action.action}</span>
                            <Badge variant="outline" className={`text-xs ${
                              action.priority === 'immediate' ? 'border-risk-critical/30 text-risk-critical' :
                              action.priority === 'high' ? 'border-risk-medium/30 text-risk-medium' :
                              'border-gray-500/30 text-gray-400'
                            }`}>
                              {action.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-navy-700 border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-400 mb-1">Account Status</p>
                          <Badge className={`${
                            analysis.account_status === 'FREEZE' ? 'bg-risk-critical' :
                            analysis.account_status === 'MONITOR' ? 'bg-risk-medium' :
                            'bg-risk-low'
                          }`}>
                            {analysis.account_status}
                          </Badge>
                        </CardContent>
                      </Card>
                      <Card className="bg-navy-700 border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-400 mb-1">Case Priority</p>
                          <Badge className={`${
                            analysis.case_priority === 'URGENT' ? 'bg-risk-critical' :
                            analysis.case_priority === 'HIGH' ? 'bg-risk-medium' :
                            'bg-gray-600'
                          }`}>
                            {analysis.case_priority}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Escalate Toggle */}
                    <div className="flex items-center justify-between p-4 bg-navy-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertOctagon className="w-5 h-5 text-risk-medium" />
                        <div>
                          <p className="font-medium text-sm">Escalate to Human</p>
                          <p className="text-xs text-gray-400">Route to senior compliance officer</p>
                        </div>
                      </div>
                      <Switch checked={analysis.escalate_to_human} />
                    </div>

                    {/* Customer Notification */}
                    {analysis.customer_notification && analysis.customer_notification !== "No customer notification required." && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">CUSTOMER NOTIFICATION</h3>
                        <Card className="bg-navy-700 border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Send className="w-4 h-4 text-gray-400 mt-1" />
                              <p className="text-sm text-gray-300">{analysis.customer_notification}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Stats card component
function StatsCard({ title, value, icon: Icon, trend, color }) {
  return (
    <Card className="bg-navy-800 border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, flagged: 0, blocked: 0, review: 0, clear: 0 });
  const [isLive, setIsLive] = useState(true);

  // Manual analysis form state
  const [manualForm, setManualForm] = useState({
    account_id: '',
    amount: '',
    merchant: '',
    location: '',
    time_seconds: '',
    device_ip: ''
  });

  // Load transactions
  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setFilteredTransactions(data.transactions || []);
      })
      .catch(err => console.error('Failed to load transactions:', err));

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data.stats || {}))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  // Filter transactions
  useEffect(() => {
    let filtered = [...transactions];

    if (riskFilter !== 'all') {
      filtered = filtered.filter(t => {
        const level = getRiskLevel(t.risk_score);
        return level === riskFilter;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.account_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, riskFilter, statusFilter, searchQuery]);

  const openCase = (transaction) => {
    setSelectedTransaction(transaction);
    setDrawerOpen(true);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const txn = {
      transaction_id: `TXN-${Date.now()}`,
      account_id: manualForm.account_id || 'ACC-MANUAL',
      amount: parseFloat(manualForm.amount) || 0,
      merchant: manualForm.merchant || 'Manual Entry',
      location: manualForm.location || 'US',
      time_seconds: parseInt(manualForm.time_seconds) || 43200,
      device_ip: manualForm.device_ip || '0.0.0.0'
    };
    setSelectedTransaction(txn);
    setDrawerOpen(true);
  };

  const alerts = transactions.filter(t => t.risk_score >= 66).sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="bg-navy-800 border-b border-border sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-risk-critical" />
                <span className="text-2xl font-bold">Flagr</span>
              </div>
              <span className="text-xs text-gray-500 bg-navy-700 px-2 py-1 rounded">v2.1.0</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Live indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-risk-low animate-pulse' : 'bg-gray-500'}`} />
                <span className={`text-sm ${isLive ? 'text-risk-low' : 'text-gray-500'}`}>
                  {isLive ? 'Live' : 'Paused'}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-risk-critical rounded-full text-xs flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-navy-800 border border-border mb-6">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-navy-700">
              <Activity className="w-4 h-4 mr-2" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="analyze" className="data-[state=active]:bg-navy-700">
              <Search className="w-4 h-4 mr-2" /> Analyze
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-navy-700">
              <AlertTriangle className="w-4 h-4 mr-2" /> Alerts
              {alerts.length > 0 && (
                <Badge className="ml-2 bg-risk-critical">{alerts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {/* Stats Row */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <StatsCard title="Total" value={stats.total} icon={TrendingUp} color="#8884d8" />
              <StatsCard title="Flagged" value={stats.flagged} icon={AlertTriangle} color={COLORS.critical} />
              <StatsCard title="Blocked" value={stats.blocked} icon={XCircle} color="#ff6b6b" />
              <StatsCard title="Under Review" value={stats.review} icon={Eye} color={COLORS.medium} />
              <StatsCard title="Clear" value={stats.clear} icon={CheckCircle} color={COLORS.low} />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions, accounts, merchants..."
                    className="pl-10 bg-navy-800 border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40 bg-navy-800 border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-border">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-navy-800 border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Transaction Table */}
            <Card className="bg-navy-800 border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Merchant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Level</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((txn, idx) => (
                        <motion.tr
                          key={txn.transaction_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-border hover:bg-navy-700/50 cursor-pointer transition-colors"
                          onClick={() => openCase(txn)}
                        >
                          <td className="px-4 py-3 font-mono text-sm">{txn.transaction_id}</td>
                          <td className="px-4 py-3 font-mono text-sm text-gray-400">{txn.account_id}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(txn.amount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-300 max-w-[150px] truncate">{txn.merchant}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="outline" className="font-mono">{txn.location}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{formatTime(txn.time_seconds)}</td>
                          <td className="px-4 py-3">
                            <RiskScoreBar score={txn.risk_score} />
                          </td>
                          <td className="px-4 py-3">
                            <RiskLevelChip score={txn.risk_score} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={txn.status} />
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCase(txn);
                              }}
                            >
                              <Search className="w-4 h-4 mr-1" /> Analyze
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analyze Tab */}
          <TabsContent value="analyze">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-navy-800 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-risk-critical" />
                    Manual Transaction Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Account ID</Label>
                        <Input
                          placeholder="ACC-XXXX"
                          className="bg-navy-700 border-border mt-1"
                          value={manualForm.account_id}
                          onChange={(e) => setManualForm({...manualForm, account_id: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Amount ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-navy-700 border-border mt-1"
                          value={manualForm.amount}
                          onChange={(e) => setManualForm({...manualForm, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Merchant</Label>
                        <Input
                          placeholder="Merchant name"
                          className="bg-navy-700 border-border mt-1"
                          value={manualForm.merchant}
                          onChange={(e) => setManualForm({...manualForm, merchant: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Location (Country Code)</Label>
                        <Input
                          placeholder="US, EU, CN..."
                          className="bg-navy-700 border-border mt-1"
                          value={manualForm.location}
                          onChange={(e) => setManualForm({...manualForm, location: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Time (seconds from midnight)</Label>
                        <Input
                          type="number"
                          placeholder="43200"
                          className="bg-navy-700 border-border mt-1"
                          value={manualForm.time_seconds}
                          onChange={(e) => setManualForm({...manualForm, time_seconds: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Device IP</Label>
                        <Input
                          placeholder="192.168.1.1"
                          className="bg-navy-700 border-border mt-1"
                          value={manualForm.device_ip}
                          onChange={(e) => setManualForm({...manualForm, device_ip: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-risk-critical hover:bg-risk-critical/90">
                      <Zap className="w-4 h-4 mr-2" /> Run Flagr Analysis
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-navy-800 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-risk-low" />
                </div>
                <h3 className="text-xl font-semibold mb-2">All Clear</h3>
                <p className="text-gray-400">No critical or high-risk alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert, idx) => (
                  <motion.div
                    key={alert.transaction_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`border ${
                      alert.risk_score >= 90 ? 'border-risk-critical bg-risk-critical/5' :
                      'border-risk-medium bg-risk-medium/5'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              alert.risk_score >= 90 ? 'bg-risk-critical/20' : 'bg-risk-medium/20'
                            }`}>
                              <AlertOctagon className={`w-6 h-6 ${
                                alert.risk_score >= 90 ? 'text-risk-critical animate-pulse-red' : 'text-risk-medium'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{alert.transaction_id}</span>
                                <RiskLevelChip score={alert.risk_score} />
                                {alert.risk_score >= 90 && (
                                  <Badge className="bg-risk-critical animate-pulse-red">URGENT</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">
                                {alert.account_id} • {formatCurrency(alert.amount)} • {alert.merchant}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-gray-600">
                              Dismiss
                            </Button>
                            <Button variant="outline" size="sm" className="border-risk-medium text-risk-medium">
                              Escalate
                            </Button>
                            <Button
                              size="sm"
                              className="bg-risk-critical hover:bg-risk-critical/90"
                              onClick={() => openCase(alert)}
                            >
                              View Case <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Case Detail Drawer */}
      <CaseDetailDrawer
        transaction={selectedTransaction}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
