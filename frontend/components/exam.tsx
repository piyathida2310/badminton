import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const MatchNode = ({ data }: any) => {
    return (
        <div style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            background: 'white',
            minWidth: '150px',
            fontSize: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            {/* จุดรับเส้น (Input) ด้านซ้าย - ยกเว้นรอบแรก */}
            {data.round !== 0 && (
                <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
            )}

            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#888' }}>
                {data.label}
            </div>

            {/* Team A */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{data.team1 || 'TBD'}</span>
                <span style={{ background: '#eee', padding: '0 5px' }}>-</span>
            </div>

            {/* Team B */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{data.team2 || 'TBD'}</span>
                <span style={{ background: '#eee', padding: '0 5px' }}>-</span>
            </div>

            {/* จุดส่งเส้น (Output) ด้านขวา - ยกเว้นรอบชิง */}
            {data.round !== 4 && (
                <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
            )}
        </div>
    );
};

export default memo(MatchNode);