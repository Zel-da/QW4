import React, { useState, useEffect, useCallback } from 'react';
import apiClient from './apiConfig';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const ReportListView = ({ onSelectReport }) => {
    const [reports, setReports] = useState([]);
    const [teams, setTeams] = useState([]);
    const [filters, setFilters] = useState({ 
        startDate: new Date().toISOString().slice(0, 10), 
        endDate: new Date().toISOString().slice(0, 10), 
        teamId: '' 
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiClient.get('/api/tbm/teams')
            .then(response => setTeams(response.data))
            .catch(error => console.error("Error fetching teams:", error));
    }, []);

    const fetchReports = useCallback(() => {
        setLoading(true);
        apiClient.get('/api/tbm/reports', { params: filters })
            .then(response => setReports(response.data))
            .catch(error => console.error("Error fetching reports:", error))
            .finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => {
        if (filters.startDate && filters.endDate) {
            fetchReports();
        } else {
            setReports([]);
        }
    }, [filters, fetchReports]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">제출된 점검표 목록</h2>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="startDate">시작일:</Label>
                    <Input
                        id="startDate"
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-48"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="endDate">종료일:</Label>
                    <Input
                        id="endDate"
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-48"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="team">팀:</Label>
                    <select
                        id="team"
                        name="teamId"
                        value={filters.teamId}
                        onChange={handleFilterChange}
                        className="flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">모든 팀</option>
                        {Array.isArray(teams) && teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            {loading ? (
                <p>목록을 불러오는 중...</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {reports.length > 0 ? reports.map(report => (
                        <Card key={report.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>점검표 #{report.id}</CardTitle>
                                <CardDescription>{new Date(report.reportDate).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground flex-grow">
                                <p><b>팀:</b> {report.team?.name}</p>
                                <p><b>작성자:</b> {report.managerName}</p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => onSelectReport(report.id)} className="w-full">
                                    상세 보기
                                </Button>
                            </CardFooter>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center text-muted-foreground py-10">
                            <p>선택한 기간에 해당하는 점검표가 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportListView;
