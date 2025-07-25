
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PollResult } from '@/hooks/useInvestmentPolls';

interface PollResultsChartProps {
  results: PollResult[];
  pollType: 'simple' | 'multiple_choice' | 'ranked' | 'weighted';
  pollStatus: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function PollResultsChart({ results, pollType, pollStatus }: PollResultsChartProps) {
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No results available yet
        </CardContent>
      </Card>
    );
  }

  const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0);
  const totalVotingPower = results.reduce((sum, result) => sum + result.total_voting_power, 0);

  const chartData = results.map((result, index) => ({
    name: result.option_text,
    value: result.vote_count,
    percentage: result.vote_percentage,
    votingPower: result.total_voting_power,
    fill: COLORS[index % COLORS.length]
  }));

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [
            `${value} votes (${((value / totalVotes) * 100).toFixed(1)}%)`,
            'Votes'
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`${value} votes`, 'Votes']}
        />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Poll Results</CardTitle>
          <Badge variant={pollStatus === 'closed' ? 'default' : 'secondary'}>
            {pollStatus === 'closed' ? 'Final Results' : 'Live Results'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalVotingPower.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Voting Power Used</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{results.length}</div>
            <div className="text-sm text-gray-600">Options</div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="space-y-4">
          <h4 className="font-semibold">Vote Distribution</h4>
          {results.length <= 4 ? renderPieChart() : renderBarChart()}
        </div>

        {/* Detailed Results */}
        <div className="space-y-3">
          <h4 className="font-semibold">Detailed Results</h4>
          {results
            .sort((a, b) => b.vote_count - a.vote_count)
            .map((result, index) => (
              <div key={result.option_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{result.option_text}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{result.vote_count} votes</div>
                    <div className="text-sm text-gray-600">
                      {result.vote_percentage.toFixed(1)}% • {result.total_voting_power.toFixed(1)}% power
                    </div>
                  </div>
                </div>
                <Progress value={result.vote_percentage} className="h-2" />
              </div>
            ))}
        </div>

        {pollStatus === 'active' && (
          <div className="text-sm text-gray-500 text-center">
            Results update in real-time as votes are cast
          </div>
        )}
      </CardContent>
    </Card>
  );
}
